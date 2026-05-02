import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashDjangoPassword, generateTokens } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, country, city, role, password } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({
        success: false,
        message: 'Name, email, password, and role are required',
      }, { status: 400 });
    }

    const existingUser = await prisma.users_user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'A user with this email already exists',
        errors: { email: ['User with this email already exists.'] }
      }, { status: 400 });
    }

    const hashedPassword = hashDjangoPassword(password);
    const now = new Date();

    const newUser = await prisma.users_user.create({
      data: {
        password: hashedPassword,
        last_login: null,
        is_superuser: false,
        first_name: name.split(' ')[0] || '',
        last_name: name.split(' ').slice(1).join(' ') || '',
        is_staff: false,
        is_active: true,
        date_joined: now,
        name: name,
        email: email,
        phone: phone || '',
        country: country || '',
        city: city || '',
        role: role,
        created_at: now,
      },
    });

    // Generate tokens for automatic login after registration
    const tokens = generateTokens({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      data: {
        access: tokens.access,
        refresh: tokens.refresh,
        user: {
          id: Number(newUser.id),
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        }
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      message: 'An internal server error occurred',
      debug: error.message
    }, { status: 500 });
  }
}
