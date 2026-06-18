import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const adminCheck = await requireAdmin(request);
  if (!adminCheck.ok) return adminCheck.response;

  try {
    const body = await request.json();
    const reason = String(body?.reason || 'Policy warning issued by admin').trim();
    const targetId = BigInt(params.id);

    const user = await prisma.users_user.findUnique({ where: { id: targetId }, select: { id: true } });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    await prisma.notifications_notification.create({
      data: {
        title: 'Admin Warning',
        message: reason,
        read_status: false,
        created_at: new Date(),
        user_id: targetId,
      },
    });

    return NextResponse.json({ success: true, message: 'Warning sent successfully' });
  } catch (error) {
    console.error('Admin warn user error:', error);
    return NextResponse.json({ success: false, message: 'Failed to send warning' }, { status: 500 });
  }
}
