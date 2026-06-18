import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { serialize } from '@/lib/utils';

const ALLOWED_STATUSES = new Set(['pending', 'in_progress', 'completed', 'approved', 'released']);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  const { id, milestoneId } = await params;

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
    const status = String(body?.status || '').trim();

    if (!ALLOWED_STATUSES.has(status)) {
      return NextResponse.json({ message: 'Invalid milestone status' }, { status: 400 });
    }

    const [project, milestone] = await Promise.all([
      prisma.projects_projects.findUnique({ where: { id: BigInt(id) } }),
      prisma.projects_milestones.findFirst({
        where: {
          id: BigInt(milestoneId),
          project_id: BigInt(id),
        },
      }),
    ]);

    if (!project || !milestone) {
      return NextResponse.json({ message: 'Project or milestone not found' }, { status: 404 });
    }

    const userId = BigInt(decoded.user_id);
    const isClient = project.client_id === userId;
    const isProfessional = project.professional_id === userId;

    if (!isClient && !isProfessional) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    if (status === 'completed' && !isProfessional) {
      return NextResponse.json({ message: 'Only assigned professional can mark milestone completed' }, { status: 403 });
    }

    if (status === 'approved') {
      if (!isClient) {
        return NextResponse.json({ message: 'Only client can approve milestone' }, { status: 403 });
      }
      if (milestone.status !== 'completed') {
        return NextResponse.json({ message: 'Milestone must be completed before approval' }, { status: 400 });
      }
    }

    if (status === 'released' && !isClient) {
      return NextResponse.json({ message: 'Only client can set released status' }, { status: 403 });
    }

    const updatedMilestone = await prisma.projects_milestones.update({
      where: { id: BigInt(milestoneId) },
      data: { status },
    });

    return NextResponse.json({ success: true, data: serialize(updatedMilestone) });
  } catch (error) {
    console.error('Error updating milestone:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}