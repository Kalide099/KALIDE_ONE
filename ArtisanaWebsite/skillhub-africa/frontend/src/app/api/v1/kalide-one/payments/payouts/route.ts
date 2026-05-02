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
    const { amount, provider, phoneNumber } = body;

    if (!amount || !provider || !phoneNumber) {
      return NextResponse.json({ message: 'Missing parameters' }, { status: 400 });
    }

    const userId = BigInt(decoded.user_id);

    // 1. Check wallet balance
    const wallet = await prisma.payments_wallet.findUnique({
      where: { user_id: userId }
    });

    if (!wallet || parseFloat(wallet.balance.toString()) < parseFloat(amount)) {
      return NextResponse.json({ message: 'Insufficient balance' }, { status: 400 });
    }

    // 2. Start a transaction (Simplified)
    const transaction = await prisma.$transaction([
      // Deduct balance
      prisma.payments_wallet.update({
        where: { user_id: userId },
        data: { balance: (parseFloat(wallet.balance.toString()) - parseFloat(amount)).toFixed(2) }
      }),
      // Create transaction record
      prisma.payments_transaction.create({
        data: {
          wallet_id: wallet.id,
          amount: amount,
          type: 'payout',
          status: 'pending',
          reference: `MM-${provider.toUpperCase()}-${Date.now()}`,
          created_at: new Date()
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      message: 'Payout request initiated via Mobile Money.',
      transactionId: transaction[1].id.toString()
    });
  } catch (error) {
    console.error('Payout error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
