import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { serialize } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const verifiedOnly = searchParams.get('verified') === 'true';
    const skills = (searchParams.get('skills') || '').trim();
    const location = (searchParams.get('location') || '').trim();
    const minRatingParam = Number(searchParams.get('minRating') || '0');
    const minRating = Number.isNaN(minRatingParam) ? 0 : Math.max(0, minRatingParam);

    const where: Record<string, unknown> = {
      ...(verifiedOnly ? { is_verified: true } : {}),
      ...(minRating > 0 ? { rating: { gte: minRating } } : {}),
      ...(skills ? { skills: { contains: skills } } : {}),
      ...(location
        ? {
            users_user: {
              OR: [
                { city: { contains: location } },
                { country: { contains: location } },
              ],
            },
          }
        : {}),
    };

    const professionals = await prisma.marketplace_professionals.findMany({
      where,
      include: {
        users_user: {
          select: {
            id: true,
            name: true,
            email: true,
            city: true,
            country: true,
            role: true,
          }
        }
      },
      orderBy: {
        rating: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: serialize(professionals)
    });
  } catch (error: any) {
    console.error('Professionals fetch error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch professionals',
    }, { status: 500 });
  }
}
