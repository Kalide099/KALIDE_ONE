import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateAccessToken, verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const refreshToken = body?.refresh;

    if (!refreshToken || typeof refreshToken !== 'string') {
      return NextResponse.json({ success: false, message: 'Refresh token is required' }, { status: 400 });
    }

    const decoded = verifyToken(refreshToken);
    if (!decoded?.user_id) {
      return NextResponse.json({ success: false, message: 'Invalid refresh token' }, { status: 401 });
    }

    const user = await prisma.users_user.findUnique({
      where: { id: BigInt(decoded.user_id) },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const access = generateAccessToken({
      user_id: Number(user.id),
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      access,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Unable to refresh session' }, { status: 401 });
  }
}
