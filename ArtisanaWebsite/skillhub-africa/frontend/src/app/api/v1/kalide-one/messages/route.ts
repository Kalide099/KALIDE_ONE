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
    const { content, source_language, conversation_id, room_name } = body;

    // Simulate AI Translation (matching Django backend logic)
    const translated_content: any = {};
    const sourceLang = source_language || 'en';
    
    if (sourceLang === 'en') {
      translated_content['fr'] = `[Traduit par l'IA]: ${content}`;
      translated_content['es'] = `[Traducido por IA]: ${content}`;
    } else if (sourceLang === 'fr') {
      translated_content['en'] = `[Translated by AI]: ${content}`;
      translated_content['es'] = `[Traducido por IA]: ${content}`;
    } else {
      translated_content['en'] = `[Translated by AI]: ${content}`;
      translated_content['fr'] = `[Traduit par l'IA]: ${content}`;
    }

    const newMessage = await prisma.messaging_message.create({
      data: {
        content,
        source_language: sourceLang,
        translated_content: JSON.stringify(translated_content),
        timestamp: new Date(),
        sender_id: BigInt(decoded.user_id),
        conversation_id: conversation_id ? BigInt(conversation_id) : undefined,
        room_name: room_name || ''
      }
    });

    return NextResponse.json(serialize(newMessage), { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
