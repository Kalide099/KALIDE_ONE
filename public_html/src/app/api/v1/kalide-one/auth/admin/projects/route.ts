import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { serialize } from '@/lib/utils';

export async function GET(request: Request) {
  const adminCheck = await requireAdmin(request);
  if (!adminCheck.ok) return adminCheck.response;

  try {
    const projects = await prisma.projects_projects.findMany({
      orderBy: { id: 'desc' },
      include: {
        users_user_projects_projects_client_idTousers_user: {
          select: { id: true, name: true, email: true },
        },
        users_user_projects_projects_professional_idTousers_user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: serialize(projects) });
  } catch (error) {
    console.error('Admin projects fetch error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch projects' }, { status: 500 });
  }
}
