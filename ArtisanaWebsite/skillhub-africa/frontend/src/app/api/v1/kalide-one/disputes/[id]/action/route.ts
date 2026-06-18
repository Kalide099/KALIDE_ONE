import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { serialize } from '@/lib/utils';

function getBearerToken(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1];
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const token = getBearerToken(request);
  if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  const decoded = verifyToken(token);
  if (!decoded) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await context.params;
    const disputeId = BigInt(id);
    const userId = BigInt(decoded.user_id);
    const isAdmin = decoded.role === 'admin';

    const body = await request.json();
    const { action, note, resolution } = body;

    const dispute = await prisma.disputes_dispute.findUnique({
      where: { id: disputeId },
      include: { disputes_justicenodeaisettlement: true },
    });

    if (!dispute) {
      return NextResponse.json({ success: false, message: 'Dispute not found' }, { status: 404 });
    }

    const isParticipant = dispute.initiator_id === userId || dispute.respondent_id === userId;
    if (!isParticipant && !isAdmin) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    if (action === 'accept_ai_settlement') {
      if (!dispute.disputes_justicenodeaisettlement) {
        return NextResponse.json({ success: false, message: 'AI settlement not available' }, { status: 400 });
      }

      const updated = await prisma.$transaction(async (tx) => {
        await tx.disputes_justicenodeaisettlement.update({
          where: { dispute_id: disputeId },
          data: { is_accepted_by_both: true },
        });

        const resolved = await tx.disputes_dispute.update({
          where: { id: disputeId },
          data: {
            status: 'resolved',
            resolution: 'ai_settlement_accepted',
            resolution_notes: String(note || 'AI settlement accepted by participant'),
            resolved_at: new Date(),
            resolved_by_id: userId,
            updated_at: new Date(),
          },
        });

        await tx.disputes_disputemessage.create({
          data: {
            dispute_id: disputeId,
            sender_id: userId,
            message: 'AI settlement accepted.',
            attachments: '',
            is_admin_message: false,
            created_at: new Date(),
          },
        });

        return resolved;
      });

      return NextResponse.json({ success: true, data: serialize(updated) });
    }

    if (action === 'escalate_to_admin') {
      const escalated = await prisma.$transaction(async (tx) => {
        const updated = await tx.disputes_dispute.update({
          where: { id: disputeId },
          data: {
            status: 'escalated',
            updated_at: new Date(),
          },
        });

        await tx.disputes_disputemessage.create({
          data: {
            dispute_id: disputeId,
            sender_id: userId,
            message: `Escalation requested${note ? `: ${String(note)}` : ''}`,
            attachments: '',
            is_admin_message: false,
            created_at: new Date(),
          },
        });

        return updated;
      });

      return NextResponse.json({ success: true, data: serialize(escalated) });
    }

    if (action === 'resolve_manual') {
      if (!isAdmin) {
        return NextResponse.json({ success: false, message: 'Only admin can use manual resolution' }, { status: 403 });
      }

      const resolved = await prisma.$transaction(async (tx) => {
        const updated = await tx.disputes_dispute.update({
          where: { id: disputeId },
          data: {
            status: 'resolved',
            resolution: String(resolution || 'manual_admin_resolution'),
            resolution_notes: String(note || ''),
            resolved_at: new Date(),
            resolved_by_id: userId,
            updated_at: new Date(),
          },
        });

        await tx.disputes_disputemessage.create({
          data: {
            dispute_id: disputeId,
            sender_id: userId,
            message: `Admin resolved dispute${note ? `: ${String(note)}` : ''}`,
            attachments: '',
            is_admin_message: true,
            created_at: new Date(),
          },
        });

        return updated;
      });

      return NextResponse.json({ success: true, data: serialize(resolved) });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Dispute action error:', error);
    return NextResponse.json({ success: false, message: 'Failed to process dispute action' }, { status: 500 });
  }
}