import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../../../../generated/prisma';
import { verifyDjangoPassword, generateTokens } from '../../../../../../lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Email and password are required',
      }, { status: 400 });
    }

    const user = await prisma.users_user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials',
      }, { status: 401 });
    }

    if (!user.is_active) {
      return NextResponse.json({
        success: false,
        message: 'Account is disabled',
      }, { status: 401 });
    }

    const isPasswordValid = verifyDjangoPassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials',
      }, { status: 401 });
    }

    const tokens = generateTokens({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Update last_login
    await prisma.users_user.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });

    return NextResponse.json({
      access: tokens.access,
      refresh: tokens.refresh,
      user: {
        id: Number(user.id),
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'An internal server error occurred',
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
