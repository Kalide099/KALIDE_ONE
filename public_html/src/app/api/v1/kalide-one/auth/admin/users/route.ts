import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { serialize } from '@/lib/utils';

const VERIFICATION_TIERS: Record<string, { tier: number; label: string }> = {
  approved: { tier: 3, label: 'Tier 3 - Verified' },
  pending: { tier: 2, label: 'Tier 2 - In Review' },
  rejected: { tier: 1, label: 'Tier 1 - Restricted' },
};

function getBadgeLevel(totalBadges: number): string {
  if (totalBadges >= 4) return 'Gold';
  if (totalBadges >= 2) return 'Silver';
  if (totalBadges >= 1) return 'Bronze';
  return 'None';
}

function calculateFraudRisk(
  activeAlerts: number,
  highSeverityAlerts: number,
  verificationStatus: string
) {
  let score = activeAlerts * 15 + highSeverityAlerts * 20;

  if (verificationStatus === 'pending') score += 10;
  if (verificationStatus === 'rejected') score += 25;

  if (score > 100) score = 100;

  const level = score >= 70 ? 'high' : score >= 35 ? 'medium' : 'low';
  return { score, level };
}

function parseApplicationNotes(notes: string | null) {
  if (!notes) {
    return {
      expertiseAreas: [] as string[],
      companyBase: '',
      companyCapabilities: [] as string[],
    };
  }

  try {
    const parsed = JSON.parse(notes);
    return {
      expertiseAreas: Array.isArray(parsed?.expertiseAreas)
        ? parsed.expertiseAreas.map((item: unknown) => String(item))
        : [],
      companyBase: String(parsed?.companyBase || ''),
      companyCapabilities: Array.isArray(parsed?.companyCapabilities)
        ? parsed.companyCapabilities.map((item: unknown) => String(item))
        : [],
    };
  } catch {
    return {
      expertiseAreas: [] as string[],
      companyBase: '',
      companyCapabilities: [] as string[],
    };
  }
}

export async function GET(request: Request) {
  const adminCheck = await requireAdmin(request);
  if (!adminCheck.ok) return adminCheck.response;

  try {
    const users = await prisma.users_user.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        trust_safety_professional_verifications: {
          orderBy: { submitted_at: 'desc' },
          take: 1,
        },
        marketplace_professionals: {
          include: {
            marketplace_professionals_badges: {
              include: {
                artisans_badge: {
                  select: { name: true },
                },
              },
            },
          },
        },
        fraud_detection_fraudalert: {
          where: {
            status: { in: ['new', 'open', 'investigating'] },
          },
        },
      },
    });

    const data = users.map((user) => {
      const latestApplication = user.trust_safety_professional_verifications[0];
      const applicationStatus = latestApplication?.verification_status || (user.is_active ? 'approved' : 'pending');
      const notes = parseApplicationNotes(latestApplication?.admin_notes || null);
      const verificationTier = VERIFICATION_TIERS[applicationStatus] || { tier: 0, label: 'Tier 0 - Unverified' };

      const badges = user.marketplace_professionals?.marketplace_professionals_badges?.map(
        (item) => item.artisans_badge.name
      ) || [];
      const badgeLevel = getBadgeLevel(badges.length);

      const activeAlerts = user.fraud_detection_fraudalert.length;
      const highSeverityAlerts = user.fraud_detection_fraudalert.filter(
        (alert) => alert.severity.toLowerCase() === 'high'
      ).length;
      const fraudRisk = calculateFraudRisk(activeAlerts, highSeverityAlerts, applicationStatus);

      return {
        id: Number(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        phone: user.phone,
        city: user.city,
        country: user.country,
        created_at: user.created_at,
        application_status: applicationStatus,
        profile_photo: latestApplication?.document_file || null,
        expertise_areas: notes.expertiseAreas,
        company_base: notes.companyBase,
        company_capabilities: notes.companyCapabilities,
        verification_tier: verificationTier,
        badges,
        badge_level: badgeLevel,
        fraud_risk_score: fraudRisk.score,
        fraud_risk_level: fraudRisk.level,
        active_alerts: activeAlerts,
        high_severity_alerts: highSeverityAlerts,
      };
    });

    return NextResponse.json({ success: true, data: serialize(data) });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch users' }, { status: 500 });
  }
}
