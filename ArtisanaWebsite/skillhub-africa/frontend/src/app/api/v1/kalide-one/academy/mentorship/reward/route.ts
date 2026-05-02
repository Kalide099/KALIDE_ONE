import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { sessionId, amount } = body;

    if (!sessionId) {
      return NextResponse.json({ message: 'Missing sessionId' }, { status: 400 });
    }

    // 1. Fetch the mentorship session
    const session = await prisma.services_mentorshipsession.findUnique({
      where: { id: BigInt(sessionId) }
    });

    if (!session) {
      return NextResponse.json({ message: 'Session not found' }, { status: 404 });
    }

    const expertId = session.expert_id;
    const tokenAmount = amount || 10; // Default 10 tokens

    // 2. Award tokens in a transaction
    const result = await prisma.$transaction([
      // Increment user tokens
      prisma.users_user.update({
        where: { id: expertId },
        data: { mentorship_tokens: { increment: tokenAmount } }
      }),
      // Create reward record
      prisma.mentorship_rewards.create({
        data: {
          user_id: expertId,
          amount: tokenAmount,
          type: 'earned',
          reason: `Completed mentorship session: ${session.title}`,
          created_at: new Date()
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      message: `Awarded ${tokenAmount} Mentorship Tokens.`,
      newTotal: result[0].mentorship_tokens
    });
  } catch (error) {
    console.error('Mentorship reward error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
