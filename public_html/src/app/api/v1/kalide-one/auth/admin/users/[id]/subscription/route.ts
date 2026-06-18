import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

function getPlanDefaults(name: string) {
  const normalized = name.toLowerCase();
  if (normalized === 'elite') {
    return { canonical: 'elite', priceMonthly: '49.99', maxActiveProjects: 999, features: 'Elite access' };
  }
  if (normalized === 'pro') {
    return { canonical: 'pro', priceMonthly: '19.99', maxActiveProjects: 50, features: 'Pro access' };
  }
  return { canonical: 'free', priceMonthly: '0.00', maxActiveProjects: 5, features: 'Free access' };
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const adminCheck = await requireAdmin(request);
  if (!adminCheck.ok) return adminCheck.response;

  try {
    const body = await request.json();
    const requestedPlan = String(body?.plan || 'free');
    const targetId = BigInt(params.id);
    const now = new Date();

    const user = await prisma.users_user.findUnique({ where: { id: targetId }, select: { id: true } });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const defaults = getPlanDefaults(requestedPlan);

    let plan = await prisma.payments_subscriptionplan.findFirst({
      where: { name: defaults.canonical },
    });

    if (!plan) {
      plan = await prisma.payments_subscriptionplan.create({
        data: {
          name: defaults.canonical,
          price_monthly: defaults.priceMonthly,
          max_active_projects: defaults.maxActiveProjects,
          features: defaults.features,
        },
      });
    }

    await prisma.payments_usersubscription.upsert({
      where: { user_id: targetId },
      update: {
        is_active: true,
        started_at: now,
        expires_at: null,
        plan_id: plan.id,
      },
      create: {
        user_id: targetId,
        is_active: true,
        started_at: now,
        expires_at: null,
        plan_id: plan.id,
      },
    });

    return NextResponse.json({ success: true, message: `Subscription updated to ${defaults.canonical}` });
  } catch (error) {
    console.error('Admin subscription update error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update subscription' }, { status: 500 });
  }
}
