import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { serialize } from '@/lib/api-utils';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // 1. Update Quote Status
    const updatedQuote = await prisma.payments_quote.update({
      where: { id: BigInt(id) },
      data: { 
        status: 'accepted',
      },
    });

    // 2. Automatically link to project and set escrow (Mocking the financial gateway success)
    if (updatedQuote.project_id) {
        await prisma.projects_projects.update({
            where: { id: updatedQuote.project_id },
            data: {
                status: 'in_progress'
            }
        });
    }

    return NextResponse.json({
        success: true,
        message: 'Escrow funded successfully',
        data: serialize(updatedQuote)
    });
  } catch (error: any) {
    console.error('Funding error:', error);
    return NextResponse.json({ 
        success: false,
        message: 'Internal Server Error: ' + error.message 
    }, { status: 500 });
  }
}
