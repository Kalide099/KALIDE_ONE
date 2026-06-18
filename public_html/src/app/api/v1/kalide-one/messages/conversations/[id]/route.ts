import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';
import { verifyToken } from '@/lib/auth';
import { serialize } from '@/lib/api-utils';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
    const conversation = await prisma.messaging_conversation.findUnique({
      where: { id: BigInt(id) },
      include: {
        messaging_conversation_participants: {
          include: {
            users_user: {
              select: {
                id: true,
                name: true,
                first_name: true,
                last_name: true
              }
            }
          }
        },
        messaging_message: {
          include: {
            users_user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            timestamp: 'asc'
          }
        }
      }
    });

    if (!conversation) {
      return NextResponse.json({ message: 'Conversation not found' }, { status: 404 });
    }

    // Security check: Verify if the user is a participant
    const isParticipant = conversation.messaging_conversation_participants.some(
      p => p.user_id === BigInt(decoded.user_id)
    );

    if (!isParticipant) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(serialize(conversation));
  } catch (error) {
    console.error('Error fetching conversation detail:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
