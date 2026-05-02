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
      data: serialize(attendance)
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
      data: serialize(logs)
    });
  } catch (error) {
    console.error('Fetch attendance error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
