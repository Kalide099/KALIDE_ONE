import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const minRating = searchParams.get('minRating') || '0';

    // Basic Matching Algorithm:
    // 1. Filter by category
    // 2. Sort by rating (desc) and completed projects (desc)
    
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

    return NextResponse.json({
      success: true,
      data: artisans.map(artisan => ({
        ...artisan,
        id: artisan.id.toString(),
        user_id: artisan.user_id.toString(),
        // Add a "Matching Score" mock for UI
        matchScore: Math.floor(Math.random() * 20) + 80 // 80-100%
      }))
    });
  } catch (error) {
    console.error('Matching engine error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
