import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { serialize } from '@/lib/utils';
import { getAuthContext, parseTeamRole, requireTeamOwnerOrAdmin } from '../../../../_utils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; projectId: string }> }
) {
  const auth = getAuthContext(request);
  if (!auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { id, projectId } = await params;
  const teamId = BigInt(id);
  const projectIdBigInt = BigInt(projectId);

  try {
    const [team, project] = await Promise.all([
      prisma.marketplace_teams.findUnique({
        where: { id: teamId },
        include: {
          marketplace_team_members: {
            select: { professional_id: true },
          },
        },
      }),
      prisma.projects_projects.findUnique({
        where: { id: projectIdBigInt },
        select: { id: true, team_id: true },
      }),
    ]);

    if (!team) {
      return NextResponse.json({ success: false, message: 'Team not found' }, { status: 404 });
    }

    const isOwner = team.created_by_id === auth.userId;
    const isAdmin = auth.role === 'admin';
    const isMember = team.marketplace_team_members.some((member) => member.professional_id === auth.userId);

    if (!isOwner && !isAdmin && !isMember) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    if (!project || project.team_id !== teamId) {
      return NextResponse.json(
        { success: false, message: 'Project not found for this team. Assign this team to the project first.' },
        { status: 404 }
      );
    }

    const tasks = await prisma.projects_tasks.findMany({
      where: { project_id: projectIdBigInt },
      include: {
        users_user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { id: 'desc' },
    });

    const data = tasks.map((task) => ({
      id: Number(task.id),
      title: task.title,
      description: task.description,
      status: task.status,
      professional_id: Number(task.professional_id),
      project_id: Number(task.project_id),
      member: task.users_user
        ? {
            id: Number(task.users_user.id),
            name: task.users_user.name,
            email: task.users_user.email,
          }
        : null,
    }));

    return NextResponse.json({ success: true, data: serialize(data) });
  } catch (error) {
    console.error('Skill mapping list error:', error);
    return NextResponse.json({ success: false, message: 'Failed to load project skill mapping' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; projectId: string }> }
) {
  const auth = getAuthContext(request);
  if (!auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { id, projectId } = await params;
  const teamId = BigInt(id);
  const projectIdBigInt = BigInt(projectId);

  try {
    const permissionCheck = await requireTeamOwnerOrAdmin(teamId, auth);
    if (!permissionCheck.ok) {
      return permissionCheck.response ?? NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const memberId = body?.member_id ? BigInt(body.member_id) : null;
    const requiredSkill = String(body?.required_skill || '').trim();
    const taskTitle = String(body?.task_title || '').trim();
    const taskDescription = String(body?.task_description || '').trim();

    if (!memberId || !requiredSkill) {
      return NextResponse.json(
        { success: false, message: 'member_id and required_skill are required' },
        { status: 400 }
      );
    }

    const [project, member] = await Promise.all([
      prisma.projects_projects.findUnique({
        where: { id: projectIdBigInt },
        select: { id: true, team_id: true },
      }),
      prisma.marketplace_team_members.findFirst({
        where: {
          id: memberId,
          team_id: teamId,
        },
        include: {
          users_user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ]);

    if (!project || project.team_id !== teamId) {
      return NextResponse.json(
        { success: false, message: 'Project not found for this team. Assign this team to the project first.' },
        { status: 404 }
      );
    }

    if (!member) {
      return NextResponse.json({ success: false, message: 'Team member not found' }, { status: 404 });
    }

    const roleMeta = parseTeamRole(member.role);
    if (roleMeta.skills.length > 0 && !roleMeta.skills.includes(requiredSkill)) {
      return NextResponse.json(
        {
          success: false,
          message: 'This skill is not listed on the selected member profile. Update member skills or choose a matching skill.',
        },
        { status: 400 }
      );
    }

    const createdTask = await prisma.projects_tasks.create({
      data: {
        title: taskTitle || `${requiredSkill} - Team Assignment`,
        description:
          taskDescription ||
          `Skill mapped from team workflow: ${requiredSkill}. Assigned via Team Management panel.`,
        status: 'pending',
        professional_id: member.professional_id,
        project_id: projectIdBigInt,
      },
      include: {
        users_user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: serialize({
          id: Number(createdTask.id),
          title: createdTask.title,
          description: createdTask.description,
          status: createdTask.status,
          professional_id: Number(createdTask.professional_id),
          project_id: Number(createdTask.project_id),
          required_skill: requiredSkill,
          member: createdTask.users_user
            ? {
                id: Number(createdTask.users_user.id),
                name: createdTask.users_user.name,
                email: createdTask.users_user.email,
              }
            : null,
        }),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Skill mapping create error:', error);
    return NextResponse.json({ success: false, message: 'Failed to map member skill to project' }, { status: 500 });
  }
}
