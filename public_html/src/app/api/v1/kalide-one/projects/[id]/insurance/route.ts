import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { serialize } from '@/lib/api-utils';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = BigInt(id);
    const body = await req.json();
    const { reason, details, amountClaimed } = body;

    if (!reason || !amountClaimed) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const claim = await prisma.projects_insurance_claims.create({
      data: {
        project_id: projectId,
        reason: reason,
        details: details || '',
        amount_claimed: amountClaimed,
        status: 'pending',
        created_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Insurance claim submitted for administrative review.',
      data: serialize(claim)
    });
  } catch (error) {
    console.error('Insurance claim error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = BigInt(id);
    const body = await req.json();
    const { active, fee } = body;

    const updatedProject = await prisma.projects_projects.update({
      where: { id: projectId },
      data: {
        insurance_active: active,
        insurance_fee: fee
      }
    });

    return NextResponse.json({
      success: true,
      data: serialize(updatedProject)
    });
  } catch (error) {
    console.error('Project insurance update error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
