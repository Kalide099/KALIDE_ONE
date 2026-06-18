import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export type AuthContext = {
  userId: bigint;
  role: string;
};

export function getAuthContext(request: Request): AuthContext | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) return null;

  return {
    userId: BigInt(decoded.user_id),
    role: String(decoded.role || '').toLowerCase(),
  };
}

export type TeamRoleMetadata = {
  baseRole: string;
  permissions: string[];
  skills: string[];
};

export function parseTeamRole(roleValue: string): TeamRoleMetadata {
  if (!roleValue) {
    return { baseRole: 'member', permissions: [], skills: [] };
  }

  try {
    const parsed = JSON.parse(roleValue) as Partial<TeamRoleMetadata>;
    if (parsed && typeof parsed === 'object') {
      return {
        baseRole: typeof parsed.baseRole === 'string' && parsed.baseRole.trim() ? parsed.baseRole : 'member',
        permissions: Array.isArray(parsed.permissions)
          ? parsed.permissions.map((v) => String(v).trim()).filter(Boolean)
          : [],
        skills: Array.isArray(parsed.skills)
          ? parsed.skills.map((v) => String(v).trim()).filter(Boolean)
          : [],
      };
    }
  } catch {
    // Legacy plain text role fallback.
  }

  return {
    baseRole: roleValue,
    permissions: [],
    skills: [],
  };
}

export function encodeTeamRole(payload: {
  baseRole?: string;
  permissions?: string[];
  skills?: string[];
}): string {
  const normalized = {
    baseRole: String(payload.baseRole || 'member').trim() || 'member',
    permissions: (payload.permissions || []).map((v) => String(v).trim()).filter(Boolean),
    skills: (payload.skills || []).map((v) => String(v).trim()).filter(Boolean),
  };

  return JSON.stringify(normalized);
}

export async function requireTeamOwnerOrAdmin(teamId: bigint, auth: AuthContext) {
  const team = await prisma.marketplace_teams.findUnique({
    where: { id: teamId },
    select: {
      id: true,
      created_by_id: true,
    },
  });

  if (!team) {
    return {
      ok: false,
      team: null,
      response: NextResponse.json({ success: false, message: 'Team not found' }, { status: 404 }),
    };
  }

  const isAdmin = auth.role === 'admin';
  const isOwner = team.created_by_id === auth.userId;

  if (!isAdmin && !isOwner) {
    return {
      ok: false,
      team,
      response: NextResponse.json({ success: false, message: 'Only team owner or admin can perform this action' }, { status: 403 }),
    };
  }

  return {
    ok: true,
    team,
    response: null,
  };
}
