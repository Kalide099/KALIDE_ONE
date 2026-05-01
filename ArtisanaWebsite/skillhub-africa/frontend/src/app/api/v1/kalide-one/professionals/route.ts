import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';
import { serialize } from '@/lib/api-utils';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location');
  const rating = searchParams.get('rating');
  const experience = searchParams.get('experience');
  const price_min = searchParams.get('price_min');
  const price_max = searchParams.get('price_max');

  try {
    const where: any = { is_verified: true };

    if (location) {
      where.users_user = {
        OR: [
          { city: { contains: location } },
          { country: { contains: location } }
        ]
      };
    }

    if (rating) {
      where.rating = { gte: parseFloat(rating) };
    }

    if (experience) {
      where.experience_years = { gte: parseInt(experience) };
    }

    if (price_min || price_max) {
      where.hourly_rate = {};
      if (price_min) where.hourly_rate.gte = parseFloat(price_min);
      if (price_max) where.hourly_rate.lte = parseFloat(price_max);
    }

    const professionals = await prisma.marketplace_professionals.findMany({
      where,
      include: {
        users_user: {
          select: {
            id: true,
            name: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
            country: true,
            city: true,
            role: true
          }
        },
        marketplace_professionals_badges: {
          include: {
            artisans_badge: true
          }
        }
      }
    });

    return NextResponse.json(serialize(professionals));
  } catch (error) {
    console.error('Error fetching professionals:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
