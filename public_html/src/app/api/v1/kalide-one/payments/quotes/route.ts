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
    const quotes = await prisma.payments_quote.findMany({
      where: {
        OR: [
          { client_id: BigInt(decoded.user_id) },
          { artisan_id: BigInt(decoded.user_id) }
        ]
      },
      include: {
        projects_projects: {
          select: {
            title: true
          }
        },
        users_user_payments_quote_artisan_idTousers_user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json(serialize(quotes));
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

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
    const { total_amount, terms, project_id, client_id, valid_until } = body;

    const newQuote = await prisma.payments_quote.create({
      data: {
        total_amount: total_amount.toString(),
        terms: terms || '',
        status: 'pending',
        created_at: new Date(),
        valid_until: valid_until ? new Date(valid_until) : undefined,
        artisan_id: BigInt(decoded.user_id),
        client_id: BigInt(client_id),
        project_id: BigInt(project_id)
      }
    });

    return NextResponse.json(serialize(newQuote), { status: 201 });
  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
