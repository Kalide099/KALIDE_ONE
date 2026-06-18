import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

const numberValue = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const milestoneId = body?.milestone_id ? BigInt(body.milestone_id) : null;

    const project = await prisma.projects_projects.findUnique({
      where: {
        id: BigInt(id)
      },
      include: {
        payments_escrowaccount: true,
        projects_milestones: true,
      },
    });

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    // Security check: Only the client can release escrow
    if (project.client_id !== BigInt(decoded.user_id)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    if (project.escrow_released && !milestoneId) {
      return NextResponse.json({ message: 'Escrow already released' }, { status: 400 });
    }

    if (!project.professional_id) {
      return NextResponse.json({ message: 'No assigned professional for this project' }, { status: 400 });
    }

    const escrow = project.payments_escrowaccount;
    if (!escrow) {
      return NextResponse.json({ message: 'Escrow account not found for this project' }, { status: 404 });
    }

    const remainingBefore = numberValue(escrow.remaining_balance);
    if (remainingBefore <= 0) {
      return NextResponse.json({ message: 'No remaining escrow balance to release' }, { status: 400 });
    }

    let releaseAmount = 0;
    let milestoneToRelease = null as null | { id: bigint; title: string; status: string; amount: unknown };

    if (milestoneId) {
      const match = project.projects_milestones.find((m) => m.id === milestoneId);
      if (!match) {
        return NextResponse.json({ message: 'Milestone not found for project' }, { status: 404 });
      }

      if (!['approved', 'completed'].includes(match.status)) {
        return NextResponse.json({ message: 'Milestone must be approved/completed before escrow release' }, { status: 400 });
      }

      releaseAmount = Math.min(numberValue(match.amount), remainingBefore);
      milestoneToRelease = {
        id: match.id,
        title: match.title,
        status: match.status,
        amount: match.amount,
      };
    } else {
      const releasableMilestones = project.projects_milestones.filter((m) => ['approved', 'completed'].includes(m.status));
      if (releasableMilestones.length === 0) {
        return NextResponse.json({ message: 'No releasable milestones found' }, { status: 400 });
      }

      const releasableTotal = releasableMilestones.reduce((acc, m) => acc + numberValue(m.amount), 0);
      releaseAmount = Math.min(releasableTotal, remainingBefore);
    }

    if (releaseAmount <= 0) {
      return NextResponse.json({ message: 'Calculated release amount is invalid' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const existingWallet = await tx.payments_wallet.findUnique({
        where: { user_id: project.professional_id as bigint },
      });

      const wallet = existingWallet
        ? await tx.payments_wallet.update({
            where: { user_id: project.professional_id as bigint },
            data: { balance: (numberValue(existingWallet.balance) + releaseAmount).toFixed(2) },
          })
        : await tx.payments_wallet.create({
            data: {
              user_id: project.professional_id as bigint,
              balance: releaseAmount.toFixed(2),
              currency: 'USD',
            },
          });

      const escrowUpdated = await tx.payments_escrowaccount.update({
        where: { project_id: BigInt(id) },
        data: {
          released_amount: (numberValue(escrow.released_amount) + releaseAmount).toFixed(2),
          remaining_balance: (remainingBefore - releaseAmount).toFixed(2),
        },
      });

      await tx.payments_transaction.create({
        data: {
          wallet_id: wallet.id,
          amount: releaseAmount.toFixed(2),
          type: 'credit',
          status: 'completed',
          reference: milestoneToRelease
            ? `ESCROW-MILESTONE-${id}-${String(milestoneToRelease.id)}-${Date.now()}`
            : `ESCROW-FINAL-${id}-${Date.now()}`,
          created_at: new Date(),
        },
      });

      if (milestoneToRelease) {
        await tx.projects_milestones.update({
          where: { id: milestoneToRelease.id },
          data: { status: 'released' },
        });
      } else {
        await tx.projects_milestones.updateMany({
          where: {
            project_id: BigInt(id),
            status: { in: ['approved', 'completed'] },
          },
          data: { status: 'released' },
        });
      }

      const isFullyReleased = numberValue(escrowUpdated.remaining_balance) <= 0;
      const updatedProject = await tx.projects_projects.update({
        where: { id: BigInt(id) },
        data: {
          escrow_released: isFullyReleased,
          status: isFullyReleased ? 'completed' : project.status,
        },
      });

      return {
        released_amount: releaseAmount,
        remaining_balance: numberValue(escrowUpdated.remaining_balance),
        project_status: updatedProject.status,
        escrow_released: updatedProject.escrow_released,
      };
    });

    return NextResponse.json({
      success: true,
      message: milestoneToRelease
        ? `Escrow released for milestone: ${milestoneToRelease.title}`
        : 'Escrow released successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error releasing escrow:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
