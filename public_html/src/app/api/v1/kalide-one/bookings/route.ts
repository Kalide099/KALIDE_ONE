import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { serialize } from '@/lib/utils';

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
    const { professional_id, project_id, team_id, scheduled_date, start_time, end_time } = body;

    if (!professional_id || !scheduled_date || !start_time || !end_time) {
      return NextResponse.json({ message: 'professional_id, scheduled_date, start_time and end_time are required' }, { status: 400 });
    }

    const scheduledDateObj = new Date(scheduled_date);
    const startDateTime = new Date(`${scheduled_date}T${start_time}`);
    const endDateTime = new Date(`${scheduled_date}T${end_time}`);

    if (Number.isNaN(startDateTime.getTime()) || Number.isNaN(endDateTime.getTime())) {
      return NextResponse.json({ message: 'Invalid booking date/time payload' }, { status: 400 });
    }

    if (startDateTime >= endDateTime) {
      return NextResponse.json({ message: 'End time must be after start time' }, { status: 400 });
    }

    if (startDateTime < new Date()) {
      return NextResponse.json({ message: 'Cannot create booking in the past' }, { status: 400 });
    }

    const newBooking = await prisma.$transaction(async (tx) => {
      const slot = await tx.bookings_availability.findFirst({
        where: {
          professional_id: BigInt(professional_id),
          date: scheduledDateObj,
          start_time: startDateTime,
          end_time: endDateTime,
          is_booked: false,
        },
      });

      if (!slot) {
        throw new Error('Selected slot is no longer available');
      }

      const created = await tx.bookings_bookings.create({
        data: {
          status: 'pending',
          created_at: new Date(),
          client_id: BigInt(decoded.user_id),
          professional_id: BigInt(professional_id),
          project_id: project_id ? BigInt(project_id) : undefined,
          team_id: team_id ? BigInt(team_id) : undefined,
          scheduled_date: scheduledDateObj,
          start_time: startDateTime,
          end_time: endDateTime,
        }
      });

      await tx.bookings_availability.update({
        where: { id: slot.id },
        data: { is_booked: true },
      });

      return created;
    });

    return NextResponse.json(serialize(newBooking), { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    if (error instanceof Error && error.message.includes('no longer available')) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
