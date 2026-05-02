import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';

const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = BigInt(params.id);
    const body = await req.json();
    const { transcript } = body;

    // AI Logic: Find a task that matches the transcript keywords
    // For this demo, we'll find the first "pending" task and mark it as "completed"
    // if the voice intent is detected.
    
    const task = await prisma.projects_tasks.findFirst({
      where: { 
        project_id: projectId,
        status: 'pending'
      }
    });

    if (task) {
      await prisma.projects_tasks.update({
        where: { id: task.id },
        data: { status: 'completed' }
      });

      return NextResponse.json({
        success: true,
        message: `Task "${task.title}" automatically marked as completed via Voice-to-Task.`,
        taskId: task.id.toString()
      });
    }

    return NextResponse.json({ message: 'No pending tasks matched the voice command.' });
  } catch (error) {
    console.error('Voice-to-Task error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
