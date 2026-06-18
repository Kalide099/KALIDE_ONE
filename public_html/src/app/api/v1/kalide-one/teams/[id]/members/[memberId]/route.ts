import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { serialize } from '@/lib/utils';
import { encodeTeamRole, getAuthContext, parseTeamRole, requireTeamOwnerOrAdmin } from '../../../_utils';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const auth = getAuthContext(request);
  if (!auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { id, memberId } = await params;
  const teamId = BigInt(id);
  const teamMemberId = BigInt(memberId);

  try {
    const permissionCheck = await requireTeamOwnerOrAdmin(teamId, auth);
    if (!permissionCheck.ok) return permissionCheck.response;

    const existing = await prisma.marketplace_team_members.findFirst({
      where: {
        id: teamMemberId,
        team_id: teamId,
      },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Team member not found' }, { status: 404 });
    }

    const body = await request.json();
    const currentMeta = parseTeamRole(existing.role);

    const baseRole = String(body?.base_role || currentMeta.baseRole || 'member').trim();
    const permissions = Array.isArray(body?.permissions)
      ? body.permissions.map((v: unknown) => String(v).trim()).filter(Boolean)
      : currentMeta.permissions;
    const skills = Array.isArray(body?.skills)
      ? body.skills.map((v: unknown) => String(v).trim()).filter(Boolean)
      : currentMeta.skills;

    const updated = await prisma.marketplace_team_members.update({
      where: { id: teamMemberId },
      data: {
        role: encodeTeamRole({ baseRole, permissions, skills }),
      },
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
    });

    return NextResponse.json({
      success: true,
      data: serialize({
        id: Number(updated.id),
        professional_id: Number(updated.professional_id),
        base_role: baseRole,
        permissions,
        skills,
        user: updated.users_user
          ? {
              id: Number(updated.users_user.id),
              name: updated.users_user.name,
              email: updated.users_user.email,
              city: updated.users_user.city,
              country: updated.users_user.country,
            }
          : null,
      }),
    });
  } catch (error) {
    console.error('Team member update error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update team member' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const auth = getAuthContext(request);
  if (!auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { id, memberId } = await params;
  const teamId = BigInt(id);
  const teamMemberId = BigInt(memberId);

  try {
    const permissionCheck = await requireTeamOwnerOrAdmin(teamId, auth);
    if (!permissionCheck.ok) return permissionCheck.response;

    const existing = await prisma.marketplace_team_members.findFirst({
      where: {
        id: teamMemberId,
        team_id: teamId,
      },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Team member not found' }, { status: 404 });
    }

    await prisma.marketplace_team_members.delete({ where: { id: teamMemberId } });

    return NextResponse.json({ success: true, message: 'Team member removed' });
  } catch (error) {
    console.error('Team member delete error:', error);
    return NextResponse.json({ success: false, message: 'Failed to remove team member' }, { status: 500 });
  }
}
