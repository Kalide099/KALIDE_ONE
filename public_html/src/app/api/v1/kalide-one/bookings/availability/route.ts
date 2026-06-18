import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { serialize } from '@/lib/utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const professional_id = searchParams.get('professional_id');
  const date = searchParams.get('date');
  const availableOnly = searchParams.get('availableOnly') === 'true';
  const includeBooked = searchParams.get('includeBooked') === 'true';

  try {
    const where: any = {};
    if (professional_id) where.professional_id = BigInt(professional_id);
    if (date) where.date = new Date(date);

    if (availableOnly) {
      where.is_booked = false;
      where.start_time = { gte: new Date() };
    }

    if (!includeBooked && !availableOnly) {
      where.is_booked = false;
    }

    const availability = await prisma.bookings_availability.findMany({
      where,
      orderBy: [
        { date: 'asc' },
        { start_time: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      data: serialize(availability)
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
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

    return NextResponse.json({ success: true, data: serialize(newAvailability) }, { status: 201 });
  } catch (error) {
    console.error('Error creating availability:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
