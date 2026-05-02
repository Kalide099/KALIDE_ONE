import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { serialize } from '@/lib/utils';

export async function GET() {
  try {
    // Mentors are professionals who have mentorship sessions or are marked as mentors
    const mentors = await prisma.marketplace_professionals.findMany({
      where: {
        is_verified: true,
        rating: { gte: 4.5 } // Highly rated professionals are often mentors
      },
      include: {
        users_user: {
          select: {
            id: true,
            name: true,
            email: true,
            city: true,
            country: true,
          }
        }
      },
      take: 20
    });

    return NextResponse.json({
      success: true,
      data: serialize(mentors)
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to fetch mentors' }, { status: 500 });
  }
}
