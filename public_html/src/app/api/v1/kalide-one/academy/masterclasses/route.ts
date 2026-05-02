import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { serialize } from '@/lib/utils';

export async function GET() {
  try {
    const masterclasses = await prisma.services_masterclass.findMany({
      orderBy: {
        id: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: serialize(masterclasses)
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to fetch masterclasses' }, { status: 500 });
  }
}
