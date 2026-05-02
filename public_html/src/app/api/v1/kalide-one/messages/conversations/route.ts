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
    const conversations = await prisma.messaging_conversation.findMany({
      where: {
        messaging_conversation_participants: {
          some: {
            user_id: BigInt(decoded.user_id)
          }
        }
      },
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
          orderBy: {
            timestamp: 'desc'
          },
          take: 1
        }
      }
    });

    return NextResponse.json(serialize(conversations));
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
