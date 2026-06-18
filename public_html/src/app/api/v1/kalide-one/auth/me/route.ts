import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { serialize } from '@/lib/utils';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'django-insecure-your-secret-key-default-skillhub-2025';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    const user = await prisma.users_user.findUnique({
      where: { id: BigInt(decoded.user_id || decoded.id) },
      include: {
        marketplace_professionals: true,
        payments_usersubscription: {
          include: {
            payments_subscriptionplan: true
          }
        },
        payments_wallet: true
      }
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: serialize(user)
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Session expired or invalid' }, { status: 401 });
  }
}
