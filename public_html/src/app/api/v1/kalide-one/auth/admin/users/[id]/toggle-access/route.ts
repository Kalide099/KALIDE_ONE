import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const adminCheck = await requireAdmin(request);
  if (!adminCheck.ok) return adminCheck.response;

  try {
    const targetId = BigInt(params.id);
    const user = await prisma.users_user.findUnique({ where: { id: targetId } });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    if (targetId === adminCheck.adminUser.id) {
      return NextResponse.json({ success: false, message: 'You cannot block your own admin account' }, { status: 400 });
    }

    const updated = await prisma.users_user.update({
      where: { id: targetId },
      data: { is_active: !user.is_active },
      select: { id: true, is_active: true },
    });

    return NextResponse.json({
      success: true,
      message: updated.is_active ? 'User access restored' : 'User blocked successfully',
    });
  } catch (error) {
    console.error('Admin toggle access error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update user access' }, { status: 500 });
  }
}
