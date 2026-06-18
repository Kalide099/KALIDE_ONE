import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { saveProfilePhoto } from '@/lib/file-upload';
import { serialize } from '@/lib/utils';

async function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) return null;

  return prisma.users_user.findUnique({ where: { id: BigInt(decoded.user_id) } });
}

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const latest = await prisma.trust_safety_professional_verifications.findFirst({
    where: { professional_id: user.id },
    orderBy: { submitted_at: 'desc' },
  });

  return NextResponse.json({
    success: true,
    data: serialize({
      application_status: latest?.verification_status || (user.is_active ? 'approved' : 'pending'),
      profile_photo: latest?.document_file || null,
      submitted_at: latest?.submitted_at || null,
      admin_notes: latest?.admin_notes || '',
    }),
  });
}

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const documentType = String(formData.get('documentType') || 'profile_application');
    const notes = String(formData.get('notes') || 'Application resubmitted by user');
    const photo = formData.get('photo');

    if (!(photo instanceof File) || photo.size === 0) {
      return NextResponse.json({ success: false, message: 'Profile photo is required' }, { status: 400 });
    }

    const photoPath = await saveProfilePhoto(photo, user.id);
    const now = new Date();

    await prisma.trust_safety_professional_verifications.create({
      data: {
        professional_id: user.id,
        document_type: documentType,
        document_file: photoPath,
        verification_status: 'pending',
        admin_notes: notes,
        submitted_at: now,
        verified_at: null,
      },
    });

    await prisma.users_user.update({
      where: { id: user.id },
      data: { is_active: false },
    });

    return NextResponse.json({ success: true, message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Application submission error:', error);
    return NextResponse.json({ success: false, message: 'Failed to submit application' }, { status: 500 });
  }
}
