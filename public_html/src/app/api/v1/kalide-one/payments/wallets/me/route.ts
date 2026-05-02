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
    const wallet = await prisma.payments_wallet.findUnique({
      where: { user_id: BigInt(decoded.user_id) },
      include: {
        payments_transaction: {
          orderBy: { created_at: 'desc' },
          take: 10
        }
      }
    });

    if (!wallet) {
      // Create wallet if it doesn't exist for the user
      const newWallet = await prisma.payments_wallet.create({
        data: {
          balance: "0.00",
          currency: 'USD',
          user_id: BigInt(decoded.user_id)
        }
      });
      return NextResponse.json(serialize(newWallet));
    }

    return NextResponse.json(serialize(wallet));
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
