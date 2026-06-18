import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { serialize } from '@/lib/utils';
import { getAuthContext, parseTeamRole } from './_utils';

export async function GET(request: Request) {
  const auth = getAuthContext(request);
  if (!auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const teams = await prisma.marketplace_teams.findMany({
      where: {
        OR: [
          { created_by_id: auth.userId },
          { marketplace_team_members: { some: { professional_id: auth.userId } } },
        ],
      },
      orderBy: { id: 'desc' },
      include: {
        artisans_skillcategory: {
          select: { id: true, name: true },
        },
        users_user: {
          select: { id: true, name: true, email: true },
        },
        marketplace_team_members: {
          include: {
            users_user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                city: true,
                country: true,
              },
            },
          },
        },
      },
    });

    const data = teams.map((team) => ({
      id: Number(team.id),
      name: team.name,
      description: team.description,
      category: team.artisans_skillcategory
        ? { id: Number(team.artisans_skillcategory.id), name: team.artisans_skillcategory.name }
        : null,
      owner: team.users_user
        ? {
            id: Number(team.users_user.id),
            name: team.users_user.name,
            email: team.users_user.email,
          }
        : null,
      members_count: team.marketplace_team_members.length,
      members: team.marketplace_team_members.map((member) => {
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
      }),
    }));

    return NextResponse.json({ success: true, data: serialize(data) });
  } catch (error) {
    console.error('Teams list error:', error);
    return NextResponse.json({ success: false, message: 'Failed to load teams' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = getAuthContext(request);
  if (!auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = String(body?.name || '').trim();
    const description = String(body?.description || '').trim();
    const providedCategoryId = body?.category_id ? BigInt(body.category_id) : null;

    if (!name || !description) {
      return NextResponse.json({ success: false, message: 'name and description are required' }, { status: 400 });
    }

    let categoryId = providedCategoryId;
    if (!categoryId) {
      const fallbackCategory = await prisma.artisans_skillcategory.findFirst({ select: { id: true } });
      if (!fallbackCategory) {
        return NextResponse.json(
          { success: false, message: 'No skill category found to assign this team' },
          { status: 400 }
        );
      }
      categoryId = fallbackCategory.id;
    }

    const team = await prisma.marketplace_teams.create({
      data: {
        name,
        description,
        category_id: categoryId,
        created_by_id: auth.userId,
      },
      include: {
        artisans_skillcategory: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: serialize({
          id: Number(team.id),
          name: team.name,
          description: team.description,
          category: team.artisans_skillcategory
            ? {
                id: Number(team.artisans_skillcategory.id),
                name: team.artisans_skillcategory.name,
              }
            : null,
        }),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Team create error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create team' }, { status: 500 });
  }
}
