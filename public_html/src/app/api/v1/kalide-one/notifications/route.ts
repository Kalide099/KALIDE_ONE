import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';
import { verifyToken } from '@/lib/auth';
import { serialize } from '@/lib/api-utils';

const prisma = new PrismaClient();

export async function GET(request: Request) {
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
    const notifications = await prisma.notifications_notification.findMany({
      where: { user_id: BigInt(decoded.user_id) },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json(serialize(notifications));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
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
    const { notification_id, read_status } = body;

    const updatedNotification = await prisma.notifications_notification.update({
      where: { id: BigInt(notification_id) },
      data: { read_status: !!read_status }
    });

    return NextResponse.json(serialize(updatedNotification));
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
