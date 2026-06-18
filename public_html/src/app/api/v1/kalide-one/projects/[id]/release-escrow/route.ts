import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';
import { verifyToken } from '@/lib/auth';
import { serialize } from '@/lib/api-utils';

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
    const project = await prisma.projects_projects.findUnique({
      where: {
        id: BigInt(id)
      }
    });

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    // Security check: Only the client can release escrow
    if (project.client_id !== BigInt(decoded.user_id)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    if (project.escrow_released) {
      return NextResponse.json({ message: 'Escrow already released' }, { status: 400 });
    }

    await prisma.projects_projects.update({
      where: { id: BigInt(id) },
      data: {
        escrow_released: true,
        status: 'completed'
      }
    });

    return NextResponse.json({ message: 'Escrow released successfully', status: 'completed' });
  } catch (error) {
    console.error('Error releasing escrow:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
