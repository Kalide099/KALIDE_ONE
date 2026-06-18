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
    select: { document_file: true },
  });

  return NextResponse.json({
    success: true,
    data: serialize({ profile_photo: latest?.document_file || null }),
  });
}

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const photo = formData.get('photo');

    if (!(photo instanceof File) || photo.size === 0) {
      return NextResponse.json({ success: false, message: 'Profile photo is required' }, { status: 400 });
    }

    const photoPath = await saveProfilePhoto(photo, user.id);
    const now = new Date();

    const latest = await prisma.trust_safety_professional_verifications.findFirst({
      where: { professional_id: user.id },
      orderBy: { submitted_at: 'desc' },
    });

    if (latest) {
      await prisma.trust_safety_professional_verifications.update({
        where: { id: latest.id },
        data: {
          document_file: photoPath,
          submitted_at: now,
        },
      });
    } else {
      await prisma.trust_safety_professional_verifications.create({
        data: {
          professional_id: user.id,
          document_type: 'profile_photo',
          document_file: photoPath,
          verification_status: user.is_active ? 'approved' : 'pending',
          admin_notes: 'Profile photo uploaded',
          submitted_at: now,
          verified_at: user.is_active ? now : null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: serialize({ profile_photo: photoPath }),
    });
  } catch (error) {
    console.error('Profile photo upload error:', error);
    return NextResponse.json({ success: false, message: 'Failed to upload profile photo' }, { status: 500 });
  }
}
