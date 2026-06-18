import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { serialize } from '@/lib/utils';

export async function GET(request: Request) {
  const adminCheck = await requireAdmin(request);
  if (!adminCheck.ok) return adminCheck.response;

  try {
    const invoices = await prisma.payments_invoice.findMany({
      orderBy: { created_at: 'desc' },
      take: 200,
      select: {
        id: true,
        total_amount: true,
        status: true,
        created_at: true,
      },
    });

    const data = invoices.map((item) => ({
      id: Number(item.id),
      amount: item.total_amount,
      status: item.status,
      created_at: item.created_at,
    }));

    return NextResponse.json({ success: true, data: serialize(data) });
  } catch (error) {
    console.error('Admin payments fetch error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch payments' }, { status: 500 });
  }
}
