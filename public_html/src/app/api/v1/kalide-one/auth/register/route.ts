import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashDjangoPassword } from '@/lib/auth';
import { saveProfilePhoto } from '@/lib/file-upload';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let name = '';
    let email = '';
    let phone = '';
    let country = '';
    let city = '';
    let role = '';
    let password = '';
    let profilePhoto: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      name = String(formData.get('name') || '');
      email = String(formData.get('email') || '');
      phone = String(formData.get('phone') || '');
      country = String(formData.get('country') || '');
      city = String(formData.get('city') || '');
      role = String(formData.get('role') || '');
      password = String(formData.get('password') || '');

      const uploaded = formData.get('profilePhoto');
      if (uploaded instanceof File && uploaded.size > 0) {
        profilePhoto = uploaded;
      }
    } else {
      const body = await request.json();
      name = String(body?.name || '');
      email = String(body?.email || '');
      phone = String(body?.phone || '');
      country = String(body?.country || '');
      city = String(body?.city || '');
      role = String(body?.role || '');
      password = String(body?.password || '');
    }

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
        is_active: false,
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

    let photoPath = '';
    if (profilePhoto) {
      photoPath = await saveProfilePhoto(profilePhoto, newUser.id);
    }

    await prisma.trust_safety_professional_verifications.create({
      data: {
        professional_id: newUser.id,
        document_type: 'profile_application',
        document_file: photoPath,
        verification_status: 'pending',
        admin_notes: 'Application submitted and awaiting admin review',
        submitted_at: now,
        verified_at: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Registration submitted. Your account is pending admin approval.',
      data: {
        user: {
          id: Number(newUser.id),
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          is_active: newUser.is_active,
          application_status: 'pending',
        }
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      message: 'An internal server error occurred',
    }, { status: 500 });
  }
}
