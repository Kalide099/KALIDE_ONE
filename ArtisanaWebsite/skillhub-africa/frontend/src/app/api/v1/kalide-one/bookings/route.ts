import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';
import { verifyToken } from '@/lib/auth';
import { serialize } from '@/lib/api-utils';

const prisma = new PrismaClient();

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

    const newBooking = await prisma.bookings_bookings.create({
      data: {
        status: 'pending',
        created_at: new Date(),
        client_id: BigInt(decoded.user_id),
        professional_id: BigInt(professional_id),
        project_id: project_id ? BigInt(project_id) : null,
        team_id: team_id ? BigInt(team_id) : null,
        scheduled_date: scheduled_date ? new Date(scheduled_date) : null,
        start_time: start_time ? new Date(`${scheduled_date}T${start_time}`) : null,
        end_time: end_time ? new Date(`${scheduled_date}T${end_time}`) : null,
      }
    });

    // Mark availability as booked if a matching slot is found
    if (scheduled_date && start_time) {
      await prisma.bookings_availability.updateMany({
        where: {
          professional_id: BigInt(professional_id),
          date: new Date(scheduled_date),
          // We use start_time logic similar to the Django backend
        },
        data: {
          is_booked: true
        }
      });
    }

    return NextResponse.json(serialize(newBooking), { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
