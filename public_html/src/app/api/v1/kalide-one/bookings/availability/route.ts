import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';
import { verifyToken } from '@/lib/auth';
import { serialize } from '@/lib/api-utils';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const professional_id = searchParams.get('professional_id');
  const date = searchParams.get('date');

  try {
    const where: any = {};
    if (professional_id) where.professional_id = BigInt(professional_id);
    if (date) where.date = new Date(date);

    const availability = await prisma.bookings_availability.findMany({
      where,
      orderBy: {
        date: 'asc'
      }
    });

    return NextResponse.json(serialize(availability));
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { date, start_time, end_time } = body;

    const newAvailability = await prisma.bookings_availability.create({
      data: {
        date: new Date(date),
        start_time: new Date(`${date}T${start_time}`),
        end_time: new Date(`${date}T${end_time}`),
        is_booked: false,
        professional_id: BigInt(decoded.user_id)
      }
    });

    return NextResponse.json(serialize(newAvailability), { status: 201 });
  } catch (error) {
    console.error('Error creating availability:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
