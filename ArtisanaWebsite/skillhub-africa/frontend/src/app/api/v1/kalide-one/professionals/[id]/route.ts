import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';
import { serialize } from '@/lib/api-utils';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const professional = await prisma.marketplace_professionals.findUnique({
      where: { id: BigInt(id) },
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

    if (!professional) {
      return NextResponse.json({ message: 'Professional not found' }, { status: 404 });
    }

    return NextResponse.json(serialize(professional));
  } catch (error) {
    console.error('Error fetching professional details:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
