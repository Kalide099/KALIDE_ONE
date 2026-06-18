import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { serialize } from '@/lib/utils';

function getBearerToken(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1];
}

function parseProjectTitle(projectTitle: unknown): string {
  if (!projectTitle) return 'Project';
  if (typeof projectTitle === 'string') return projectTitle;

  if (typeof projectTitle === 'object') {
    const titleRecord = projectTitle as Record<string, unknown>;
    return String(titleRecord.en || titleRecord.fr || Object.values(titleRecord)[0] || 'Project');
  }

  return 'Project';
}

export async function GET(request: Request) {
  const token = getBearerToken(request);
  if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  const decoded = verifyToken(token);
  if (!decoded) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const userId = BigInt(decoded.user_id);

    const disputes = await prisma.disputes_dispute.findMany({
      where: {
        OR: [{ initiator_id: userId }, { respondent_id: userId }],
      },
      orderBy: { created_at: 'desc' },
      include: {
        projects_projects: {
          select: {
            id: true,
            title: true,
          },
        },
        disputes_justicenodeaisettlement: true,
      },
    });

    const data = disputes.map((dispute) => ({
      id: Number(dispute.id),
      title: dispute.title,
      description: dispute.description,
      evidence: dispute.evidence,
      status: dispute.status,
      priority: dispute.priority,
      resolution: dispute.resolution,
      resolution_notes: dispute.resolution_notes,
      resolved_at: dispute.resolved_at,
      created_at: dispute.created_at,
      updated_at: dispute.updated_at,
      project_id: Number(dispute.project_id),
      project_title: parseProjectTitle(dispute.projects_projects?.title),
      initiator_id: Number(dispute.initiator_id),
      respondent_id: Number(dispute.respondent_id),
      ai_settlement: dispute.disputes_justicenodeaisettlement
        ? {
            confidence_score: Number(dispute.disputes_justicenodeaisettlement.ai_confidence_score),
            client_refund_percentage:
              dispute.disputes_justicenodeaisettlement.suggested_client_refund_percentage,
            artisan_payout_percentage:
              dispute.disputes_justicenodeaisettlement.suggested_artisan_payout_percentage,
            reasoning: dispute.disputes_justicenodeaisettlement.reasoning,
            is_accepted_by_both: dispute.disputes_justicenodeaisettlement.is_accepted_by_both,
            generated_at: dispute.disputes_justicenodeaisettlement.generated_at,
          }
        : null,
    }));

    return NextResponse.json({ success: true, data: serialize(data) });
  } catch (error) {
    console.error('Disputes list error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch disputes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const token = getBearerToken(request);
  if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  const decoded = verifyToken(token);
  if (!decoded) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { project_id, respondent_id, title, description, evidence, priority } = body;

    if (!project_id || !respondent_id || !title || !description) {
      return NextResponse.json(
        { success: false, message: 'project_id, respondent_id, title and description are required' },
        { status: 400 }
      );
    }

    const projectId = BigInt(project_id);
    const initiatorId = BigInt(decoded.user_id);
    const respondentId = BigInt(respondent_id);

    const project = await prisma.projects_projects.findUnique({
      where: { id: projectId },
      select: { client_id: true, professional_id: true },
    });

    if (!project) {
      return NextResponse.json({ success: false, message: 'Project not found' }, { status: 404 });
    }

    const isParticipant =
      project.client_id === initiatorId ||
      (project.professional_id !== null && project.professional_id === initiatorId);

    if (!isParticipant) {
      return NextResponse.json({ success: false, message: 'Only project participants can open disputes' }, { status: 403 });
    }

    const dispute = await prisma.disputes_dispute.create({
      data: {
        title: String(title),
        description: String(description),
        evidence: String(evidence || ''),
        status: 'open',
        priority: ['low', 'medium', 'high'].includes(String(priority || '')) ? String(priority) : 'medium',
        resolution: null,
        resolution_notes: '',
        created_at: new Date(),
        updated_at: new Date(),
        initiator_id: initiatorId,
        respondent_id: respondentId,
        project_id: projectId,
      },
    });

    await prisma.disputes_justicenodeaisettlement.create({
      data: {
        dispute_id: dispute.id,
        ai_confidence_score: '82.50',
        suggested_client_refund_percentage: 30,
        suggested_artisan_payout_percentage: 70,
        reasoning:
          'Initial Justice Node assessment recommends partial refund and partial payout based on evidence balance and project progress.',
        is_accepted_by_both: false,
        generated_at: new Date(),
      },
    });

    await prisma.disputes_disputemessage.create({
      data: {
        dispute_id: dispute.id,
        sender_id: initiatorId,
        message: `Dispute opened: ${String(title)}`,
        attachments: '',
        is_admin_message: false,
        created_at: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: serialize(dispute) }, { status: 201 });
  } catch (error) {
    console.error('Dispute create error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create dispute' }, { status: 500 });
  }
}