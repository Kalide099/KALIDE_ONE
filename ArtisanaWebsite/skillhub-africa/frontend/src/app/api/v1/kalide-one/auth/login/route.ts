import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyDjangoPassword, generateTokens } from '@/lib/auth';

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

    console.log('Login attempt for:', email);

    const user = await prisma.users_user.findUnique({
      where: { email },
    }).catch(err => {
      throw new Error(`DB Query Failed: ${err.message}`);
    });

    if (!user) {
      console.log('User not found:', email);
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials',
      }, { status: 401 });
    }

    console.log('User found, verifying password...');
    const isPasswordValid = await verifyDjangoPassword(password, user.password).catch(err => {
      throw new Error(`Password Verification Failed: ${err.message}`);
    });

    if (!isPasswordValid) {
      console.log('Password invalid for:', email);
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials',
      }, { status: 401 });
    }

    console.log('Password valid, generating tokens...');
    const tokens = generateTokens({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
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
  } catch (error: any) {
    console.error('CRITICAL LOGIN ERROR:', error);
    return NextResponse.json({
      success: false,
      message: 'Server Error: ' + error.message,
      stack: error.stack,
      env_check: process.env.DATABASE_URL ? 'DB_URL_SET' : 'DB_URL_MISSING'
    }, { status: 500 });
  }
}
