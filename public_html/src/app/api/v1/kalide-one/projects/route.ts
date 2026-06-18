import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { serialize } from '@/lib/api-utils';

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
    const projects = await prisma.projects_projects.findMany({
      where: {
        OR: [
          { client_id: BigInt(decoded.user_id) },
          { professional_id: BigInt(decoded.user_id) }
        ]
      },
      include: {
        projects_milestones: true,
        users_user_projects_projects_client_idTousers_user: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true
          }
        },
        users_user_projects_projects_professional_idTousers_user: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true
          }
        }
      }
    });

    return NextResponse.json(serialize(projects));
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ message: 'Internal Server Error', debug: error.message }, { status: 500 });
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
    const { title, description, budget, deadline } = body;

    const newProject = await prisma.projects_projects.create({
      data: {
        title,
        description,
        budget: budget.toString(), // Prisma Decimal handles string
        status: 'draft',
        start_date: new Date(),
        deadline: new Date(deadline),
        client_id: BigInt(decoded.user_id),
        escrow_released: false
      }
    });

    return NextResponse.json(serialize(newProject), { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
