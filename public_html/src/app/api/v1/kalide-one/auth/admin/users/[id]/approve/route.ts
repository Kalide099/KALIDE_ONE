import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const adminCheck = await requireAdmin(request);
  if (!adminCheck.ok) return adminCheck.response;

  try {
    const targetId = BigInt(params.id);
    const now = new Date();

    const user = await prisma.users_user.findUnique({ where: { id: targetId } });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    await prisma.users_user.update({
      where: { id: targetId },
      data: { is_active: true },
    });

    const latestApplication = await prisma.trust_safety_professional_verifications.findFirst({
      where: { professional_id: targetId },
      orderBy: { submitted_at: 'desc' },
    });

    if (latestApplication) {
      await prisma.trust_safety_professional_verifications.update({
        where: { id: latestApplication.id },
        data: {
          verification_status: 'approved',
          admin_notes: 'Approved by admin',
          verified_at: now,
        },
      });
    } else {
      await prisma.trust_safety_professional_verifications.create({
        data: {
          professional_id: targetId,
          document_type: 'profile_application',
          document_file: '',
          verification_status: 'approved',
          admin_notes: 'Approved by admin',
          submitted_at: now,
          verified_at: now,
        },
      });
    }

    return NextResponse.json({ success: true, message: 'User approved successfully' });
  } catch (error) {
    console.error('Admin approve user error:', error);
    return NextResponse.json({ success: false, message: 'Failed to approve user' }, { status: 500 });
  }
}
