import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { serialize } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const minRating = searchParams.get('minRating') || '0';

    const artisans = await prisma.marketplace_professionals.findMany({
      where: {
        ...(categoryId ? { users_user: { marketplace_services: { some: { category_id: BigInt(categoryId) } } } } : {}),
        rating: { gte: parseFloat(minRating) }
      },
      include: {
        users_user: {
          select: {
            name: true,
            email: true,
            city: true,
            country: true,
            role: true
          }
        }
      },
      orderBy: [
        { rating: 'desc' },
        { completed_projects: 'desc' }
      ],
      take: 5
    });

    // Add matchScore mock logic
    const results = artisans.map(artisan => ({
      ...artisan,
      matchScore: Math.floor(Math.random() * 20) + 80
    }));

    return NextResponse.json({
      success: true,
      data: serialize(results)
    });
  } catch (error) {
    console.error('Matching engine error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
