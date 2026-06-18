import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { serialize } from '@/lib/utils';
import { encodeTeamRole, getAuthContext, parseTeamRole, requireTeamOwnerOrAdmin } from '../../_utils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthContext(request);
  if (!auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const teamId = BigInt(id);

  try {
    const team = await prisma.marketplace_teams.findUnique({
      where: { id: teamId },
      include: {
        marketplace_team_members: {
          include: {
            users_user: {
              select: {
                id: true,
                name: true,
                email: true,
                city: true,
                country: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ success: false, message: 'Team not found' }, { status: 404 });
    }

    const isOwner = team.created_by_id === auth.userId;
    const isAdmin = auth.role === 'admin';
    const isMember = team.marketplace_team_members.some((member) => member.professional_id === auth.userId);

    if (!isOwner && !isAdmin && !isMember) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const data = team.marketplace_team_members.map((member) => {
      const roleMeta = parseTeamRole(member.role);
      return {
        id: Number(member.id),
        professional_id: Number(member.professional_id),
        base_role: roleMeta.baseRole,
        permissions: roleMeta.permissions,
        skills: roleMeta.skills,
        user: member.users_user
          ? {
              id: Number(member.users_user.id),
              name: member.users_user.name,
              email: member.users_user.email,
              city: member.users_user.city,
              country: member.users_user.country,
            }
          : null,
      };
    });

    return NextResponse.json({ success: true, data: serialize(data) });
  } catch (error) {
    console.error('Team members list error:', error);
    return NextResponse.json({ success: false, message: 'Failed to load team members' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthContext(request);
  if (!auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const teamId = BigInt(id);

  try {
    const permissionCheck = await requireTeamOwnerOrAdmin(teamId, auth);
    if (!permissionCheck.ok) return permissionCheck.response;

    const body = await request.json();
    const email = String(body?.email || '').trim().toLowerCase();
    const baseRole = String(body?.base_role || body?.role || 'member').trim();
    const permissions = Array.isArray(body?.permissions) ? body.permissions.map((v: unknown) => String(v)) : [];
    const skills = Array.isArray(body?.skills) ? body.skills.map((v: unknown) => String(v)) : [];

    if (!email) {
      return NextResponse.json({ success: false, message: 'email is required to invite a member' }, { status: 400 });
    }

    const targetUser = await prisma.users_user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, city: true, country: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'No user found with this email. Ask them to register first.' },
        { status: 404 }
      );
    }

    const existing = await prisma.marketplace_team_members.findFirst({
      where: {
        team_id: teamId,
        professional_id: targetUser.id,
      },
    });

    if (existing) {
      return NextResponse.json({ success: false, message: 'This user is already in the team' }, { status: 409 });
    }

    const member = await prisma.marketplace_team_members.create({
      data: {
        team_id: teamId,
        professional_id: targetUser.id,
        role: encodeTeamRole({ baseRole, permissions, skills }),
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: serialize({
          id: Number(member.id),
          professional_id: Number(member.professional_id),
          base_role: baseRole || 'member',
          permissions,
          skills,
          user: {
            id: Number(targetUser.id),
            name: targetUser.name,
            email: targetUser.email,
            city: targetUser.city,
            country: targetUser.country,
          },
        }),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Team invite error:', error);
    return NextResponse.json({ success: false, message: 'Failed to invite member' }, { status: 500 });
  }
}
