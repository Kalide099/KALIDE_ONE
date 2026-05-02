import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';

const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = BigInt(params.id);
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
      claimId: claim.id.toString()
    });
  } catch (error) {
    console.error('Insurance claim error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = BigInt(params.id);
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
      insuranceActive: updatedProject.insurance_active,
      insuranceFee: updatedProject.insurance_fee
    });
  } catch (error) {
    console.error('Project insurance update error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
