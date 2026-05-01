import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';
import { verifyToken } from '@/lib/auth';
import { serialize } from '@/lib/api-utils';

const prisma = new PrismaClient();

export async function GET(
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
    const milestones = await prisma.projects_milestones.findMany({
      where: { project_id: BigInt(id) }
    });

    return NextResponse.json(serialize(milestones));
  } catch (error) {
    console.error('Error fetching milestones:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

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
    const body = await request.json();
    const { title, description, amount, due_date } = body;

    const newMilestone = await prisma.projects_milestones.create({
      data: {
        title,
        description,
        amount: amount.toString(),
        due_date: new Date(due_date),
        status: 'pending',
        project_id: BigInt(id)
      }
    });

    return NextResponse.json(serialize(newMilestone), { status: 201 });
  } catch (error) {
    console.error('Error creating milestone:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
