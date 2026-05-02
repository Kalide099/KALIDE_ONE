import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { serialize } from '@/lib/api-utils';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = BigInt(id);
    const body = await req.json();
    const { transcript } = body;

    const task = await prisma.projects_tasks.findFirst({
      where: { 
        project_id: projectId,
        status: 'pending'
      }
    });

    if (task) {
      const updatedTask = await prisma.projects_tasks.update({
        where: { id: task.id },
        data: { status: 'completed' }
      });

      return NextResponse.json({
        success: true,
        message: `Task "${task.title}" automatically marked as completed via Voice-to-Task.`,
        data: serialize(updatedTask)
      });
    }

    return NextResponse.json({ message: 'No pending tasks matched the voice command.' });
  } catch (error) {
    console.error('Voice-to-Task error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
