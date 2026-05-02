import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = BigInt(id);
    const body = await req.json();
    const { workerId, type, location } = body;

    if (!workerId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const attendance = await prisma.projects_attendance.create({
      data: {
        project_id: projectId,
        user_id: BigInt(workerId),
        type: type,
        location: location || 'Unknown',
        timestamp: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: attendance.id.toString(),
        timestamp: attendance.timestamp,
      }
    });
  } catch (error) {
    console.error('Attendance log error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = BigInt(id);
    
    const logs = await prisma.projects_attendance.findMany({
      where: { project_id: projectId },
      include: {
        users_user: {
          select: {
            name: true,
            role: true
          }
        }
      },
      orderBy: { timestamp: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: logs.map(log => ({
        ...log,
        id: log.id.toString(),
        project_id: log.project_id.toString(),
        user_id: log.user_id.toString(),
      }))
    });
  } catch (error) {
    console.error('Fetch attendance error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
