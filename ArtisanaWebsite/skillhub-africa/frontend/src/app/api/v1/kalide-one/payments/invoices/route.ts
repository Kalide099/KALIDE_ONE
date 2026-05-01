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
    const invoices = await prisma.payments_invoice.findMany({
      where: {
        OR: [
          { client_id: BigInt(decoded.user_id) },
          { artisan_id: BigInt(decoded.user_id) }
        ]
      },
      include: {
        projects_projects: {
          select: {
            title: true,
            id: true
          }
        },
        users_user_payments_invoice_artisan_idTousers_user: {
          select: {
            name: true
          }
        },
        users_user_payments_invoice_client_idTousers_user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json(serialize(invoices));
  } catch (error) {
    console.error('Error fetching invoices:', error);
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
    const { amount_due, tax_amount, total_amount, client_id, project_id, quote_id, due_date } = body;

    const newInvoice = await prisma.payments_invoice.create({
      data: {
        amount_due: amount_due.toString(),
        tax_amount: tax_amount.toString(),
        total_amount: total_amount.toString(),
        status: 'unpaid',
        created_at: new Date(),
        due_date: new Date(due_date),
        artisan_id: BigInt(decoded.user_id),
        client_id: BigInt(client_id),
        project_id: BigInt(project_id),
        quote_id: quote_id ? BigInt(quote_id) : null
      }
    });

    return NextResponse.json(serialize(newInvoice), { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
