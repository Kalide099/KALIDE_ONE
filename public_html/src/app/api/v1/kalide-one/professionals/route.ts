import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { serialize } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const verifiedOnly = searchParams.get('verified') === 'true';

    const where = verifiedOnly ? { is_verified: true } : {};

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
      debug: error.message 
    }, { status: 500 });
  }
}
