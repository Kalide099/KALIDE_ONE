import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function requireAdmin(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { ok: false as const, response: NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) };
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return { ok: false as const, response: NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) };
  }

  const adminUser = await prisma.users_user.findUnique({
    where: { id: BigInt(decoded.user_id) },
    select: { id: true, role: true, is_staff: true, is_superuser: true },
  });

  if (!adminUser || (adminUser.role !== 'admin' && !adminUser.is_staff && !adminUser.is_superuser)) {
    return { ok: false as const, response: NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 }) };
  }

  return {
    ok: true as const,
    adminUser,
    decoded,
  };
}
