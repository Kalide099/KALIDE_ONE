import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const adminCheck = await requireAdmin(request);
  if (!adminCheck.ok) return adminCheck.response;

  try {
    const targetId = BigInt(params.id);

    if (targetId === adminCheck.adminUser.id) {
      return NextResponse.json({ success: false, message: 'You cannot delete your own admin account' }, { status: 400 });
    }

    try {
      await prisma.users_user.delete({ where: { id: targetId } });
      return NextResponse.json({ success: true, message: 'User deleted successfully' });
    } catch {
      const fallbackEmail = `deleted-${params.id}-${Date.now()}@deleted.local`;
      await prisma.users_user.update({
        where: { id: targetId },
        data: {
          is_active: false,
          email: fallbackEmail,
          name: 'Deleted User',
          first_name: 'Deleted',
          last_name: 'User',
          phone: '',
          city: '',
          country: '',
        },
      });

      return NextResponse.json({ success: true, message: 'User archived successfully' });
    }
  } catch (error) {
    console.error('Admin delete user error:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete user' }, { status: 500 });
  }
}
