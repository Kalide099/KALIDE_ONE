import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

function serialize(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (Array.isArray(obj)) return obj.map(serialize);
  if (typeof obj === 'object') {
    if (obj.constructor?.name === 'Decimal') return obj.toString();
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = serialize(obj[key]);
    }
    return newObj;
  }
  return obj;
}

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
    const project = await prisma.projects_projects.findUnique({
      where: { id: BigInt(id) },
      include: {
        projects_milestones: true,
        projects_updates: {
          include: {
            users_user: {
              select: { first_name: true, last_name: true }
            }
          }
        },
        users_user_projects_projects_client_idTousers_user: {
          select: { id: true, email: true, first_name: true, last_name: true }
        },
        users_user_projects_projects_professional_idTousers_user: {
          select: { id: true, email: true, first_name: true, last_name: true }
        }
      }
    });

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    if (project.client_id !== BigInt(decoded.user_id) && project.professional_id !== BigInt(decoded.user_id)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(serialize(project));
  } catch (error) {
    console.error('Error fetching project details:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
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
    const project = await prisma.projects_projects.findUnique({
      where: { id: BigInt(id) }
    });

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    if (project.client_id !== BigInt(decoded.user_id)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const updatedProject = await prisma.projects_projects.update({
      where: { id: BigInt(id) },
      data: body
    });

    return NextResponse.json(serialize(updatedProject));
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
