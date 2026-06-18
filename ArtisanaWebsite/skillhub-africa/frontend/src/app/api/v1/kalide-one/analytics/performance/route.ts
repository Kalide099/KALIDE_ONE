import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { serialize } from '@/lib/utils';

function parseMoney(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function percent(numerator: number, denominator: number): number {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 10000) / 100;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = BigInt(decoded.user_id);
    const role = String(decoded.role || '').toLowerCase();

    const clientProjectStatus = await prisma.projects_projects.groupBy({
      by: ['status'],
      where: { client_id: userId },
      _count: { _all: true },
    });

    const clientTotalProjects = clientProjectStatus.reduce((acc, row) => acc + row._count._all, 0);
    const clientCompletedProjects = clientProjectStatus
      .filter((row) => row.status === 'completed')
      .reduce((acc, row) => acc + row._count._all, 0);
    const clientActiveProjects = clientProjectStatus
      .filter((row) => row.status !== 'completed')
      .reduce((acc, row) => acc + row._count._all, 0);

    const clientSpend = await prisma.payments_invoice.aggregate({
      where: { client_id: userId },
      _sum: { total_amount: true },
    });

    const clientCommittedBudget = await prisma.projects_projects.aggregate({
      where: { client_id: userId },
      _sum: { budget: true },
    });

    const clientReviews = await prisma.reviews_review.aggregate({
      where: {
        projects_projects: {
          client_id: userId,
        },
      },
      _avg: { rating: true },
      _count: { _all: true },
    });

    const teamMemberships = await prisma.marketplace_team_members.findMany({
      where: { professional_id: userId },
      select: { team_id: true },
    });

    const createdTeams = await prisma.marketplace_teams.findMany({
      where: { created_by_id: userId },
      select: { id: true },
    });

    const teamIdSet = new Set<string>();
    for (const team of teamMemberships) teamIdSet.add(team.team_id.toString());
    for (const team of createdTeams) teamIdSet.add(team.id.toString());
    const teamIds = Array.from(teamIdSet).map((id) => BigInt(id));

    const workerProjects = await prisma.projects_projects.findMany({
      where: {
        OR: [
          { professional_id: userId },
          ...(teamIds.length > 0 ? [{ team_id: { in: teamIds } }] : []),
        ],
      },
      select: { id: true, client_id: true, status: true },
    });

    const workerProjectIds = workerProjects.map((project) => project.id);
    const workerCompletedProjects = workerProjects.filter((project) => project.status === 'completed').length;
    const workerActiveProjects = workerProjects.filter((project) => project.status !== 'completed').length;

    const workerQuotesSubmitted = await prisma.payments_quote.count({ where: { artisan_id: userId } });
    const workerQuotesAccepted = await prisma.payments_quote.count({
      where: {
        artisan_id: userId,
        status: { in: ['accepted', 'approved', 'signed'] },
      },
    });
    const workerQuotesResponded = await prisma.payments_quote.count({
      where: {
        artisan_id: userId,
        status: { notIn: ['draft', 'pending'] },
      },
    });

    const workerPayments = await prisma.payments_payment.findMany({
      where: {
        ...(workerProjectIds.length > 0
          ? {
              project_id: { in: workerProjectIds },
            }
          : {
              project_id: { in: [] },
            }),
      },
      select: { artisan_payment: true },
    });

    const workerEarnings = workerPayments.reduce((acc, row) => acc + parseMoney(row.artisan_payment), 0);

    const workerReviews = await prisma.reviews_review.aggregate({
      where: { reviewee_id: userId },
      _avg: { rating: true },
      _count: { _all: true },
    });

    const clientUsage = new Map<string, number>();
    for (const project of workerProjects) {
      const key = project.client_id.toString();
      clientUsage.set(key, (clientUsage.get(key) || 0) + 1);
    }
    const workerRepeatClients = Array.from(clientUsage.values()).filter((count) => count > 1).length;

    let adminMetrics: Record<string, number> | null = null;
    if (role === 'admin') {
      const [totalUsers, activeUsers, allProjectStatus, invoiceAggregate, escrowAggregate, totalQuotes, acceptedQuotes, ratingAggregate] = await Promise.all([
        prisma.users_user.count(),
        prisma.users_user.count({ where: { is_active: true } }),
        prisma.projects_projects.groupBy({
          by: ['status'],
          _count: { _all: true },
        }),
        prisma.payments_invoice.aggregate({ _sum: { total_amount: true } }),
        prisma.payments_escrowaccount.aggregate({ _sum: { remaining_balance: true } }),
        prisma.payments_quote.count(),
        prisma.payments_quote.count({ where: { status: { in: ['accepted', 'approved', 'signed'] } } }),
        prisma.reviews_review.aggregate({ _avg: { rating: true } }),
      ]);

      const totalProjects = allProjectStatus.reduce((acc, row) => acc + row._count._all, 0);
      const completedProjects = allProjectStatus
        .filter((row) => row.status === 'completed')
        .reduce((acc, row) => acc + row._count._all, 0);
      const activeProjects = allProjectStatus
        .filter((row) => row.status !== 'completed')
        .reduce((acc, row) => acc + row._count._all, 0);

      adminMetrics = {
        total_users: totalUsers,
        active_users: activeUsers,
        total_projects: totalProjects,
        active_projects: activeProjects,
        completed_projects: completedProjects,
        total_platform_volume: parseMoney(invoiceAggregate._sum.total_amount),
        total_escrow_volume: parseMoney(escrowAggregate._sum.remaining_balance),
        total_quotes: totalQuotes,
        accepted_quotes: acceptedQuotes,
        global_win_rate: percent(acceptedQuotes, totalQuotes),
        average_marketplace_rating: Number(ratingAggregate._avg.rating || 0),
      };
    }

    return NextResponse.json({
      success: true,
      data: serialize({
        role,
        client: {
          total_projects: clientTotalProjects,
          active_projects: clientActiveProjects,
          completed_projects: clientCompletedProjects,
          spend_total: parseMoney(clientSpend._sum.total_amount),
          committed_budget_total: parseMoney(clientCommittedBudget._sum.budget),
          quality_rating_avg: Number(clientReviews._avg.rating || 0),
          quality_reviews_count: clientReviews._count._all,
          on_time_completion_rate: percent(clientCompletedProjects, clientTotalProjects),
        },
        worker: {
          total_projects: workerProjects.length,
          active_projects: workerActiveProjects,
          completed_projects: workerCompletedProjects,
          quotes_submitted: workerQuotesSubmitted,
          quotes_accepted: workerQuotesAccepted,
          win_rate: percent(workerQuotesAccepted, workerQuotesSubmitted),
          response_rate: percent(workerQuotesResponded, workerQuotesSubmitted),
          earnings_total: Math.round(workerEarnings * 100) / 100,
          repeat_clients: workerRepeatClients,
          average_rating: Number(workerReviews._avg.rating || 0),
          reviews_count: workerReviews._count._all,
        },
        admin: adminMetrics,
      }),
    });
  } catch (error) {
    console.error('Performance analytics error:', error);
    return NextResponse.json({ success: false, message: 'Failed to load performance dashboard' }, { status: 500 });
  }
}
