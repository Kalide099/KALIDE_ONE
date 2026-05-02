import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { serialize } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bigIntId = BigInt(id);

    const professional = await prisma.marketplace_professionals.findUnique({
      where: { id: bigIntId },
      include: {
        users_user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true,
            country: true,
            role: true,
          }
        },
        marketplace_professionals_badges: {
          include: {
            marketplace_badge: true
          }
        }
      }
    });

    if (!professional) {
      return NextResponse.json({ success: false, message: 'Professional not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: serialize(professional)
    });
  } catch (error: any) {
    console.error('Professional detail fetch error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch professional detail',
      debug: error.message 
    }, { status: 500 });
  }
}
