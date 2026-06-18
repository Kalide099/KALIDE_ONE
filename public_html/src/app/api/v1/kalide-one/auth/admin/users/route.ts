import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { serialize } from '@/lib/utils';

export async function GET(request: Request) {
  const adminCheck = await requireAdmin(request);
  if (!adminCheck.ok) return adminCheck.response;

  try {
    const users = await prisma.users_user.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        trust_safety_professional_verifications: {
          orderBy: { submitted_at: 'desc' },
          take: 1,
        },
      },
    });

    const data = users.map((user) => {
      const latestApplication = user.trust_safety_professional_verifications[0];
      const applicationStatus = latestApplication?.verification_status || (user.is_active ? 'approved' : 'pending');

      return {
        id: Number(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        phone: user.phone,
        city: user.city,
        country: user.country,
        created_at: user.created_at,
        application_status: applicationStatus,
        profile_photo: latestApplication?.document_file || null,
      };
    });

    return NextResponse.json({ success: true, data: serialize(data) });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch users' }, { status: 500 });
  }
}
