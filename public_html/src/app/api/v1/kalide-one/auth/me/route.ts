import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { serialize } from '@/lib/utils';
import { verifyToken } from '@/lib/auth';

function parseApplicationNotes(notes: string | null) {
  if (!notes) {
    return {
      expertise_areas: [] as string[],
      company_base: '',
      company_capabilities: [] as string[],
    };
  }

  try {
    const parsed = JSON.parse(notes);
    return {
      expertise_areas: Array.isArray(parsed?.expertiseAreas)
        ? parsed.expertiseAreas.map((item: unknown) => String(item))
        : [],
      company_base: String(parsed?.companyBase || ''),
      company_capabilities: Array.isArray(parsed?.companyCapabilities)
        ? parsed.companyCapabilities.map((item: unknown) => String(item))
        : [],
    };
  } catch {
    return {
      expertise_areas: [] as string[],
      company_base: '',
      company_capabilities: [] as string[],
    };
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Session expired or invalid' }, { status: 401 });
    }
    
    const user = await prisma.users_user.findUnique({
      where: { id: BigInt(decoded.user_id) },
      include: {
        trust_safety_professional_verifications: {
          orderBy: { submitted_at: 'desc' },
          take: 1,
        },
        marketplace_professionals: true,
        payments_usersubscription: {
          include: {
            payments_subscriptionplan: true
          }
        },
        payments_wallet: true
      }
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const latestApplication = user.trust_safety_professional_verifications?.[0];
    const notes = parseApplicationNotes(latestApplication?.admin_notes || null);
    const payload = {
      ...user,
      application_status: latestApplication?.verification_status || (user.is_active ? 'approved' : 'pending'),
      profile_photo: latestApplication?.document_file || null,
      expertise_areas: notes.expertise_areas,
      company_base: notes.company_base,
      company_capabilities: notes.company_capabilities,
      has_password: Boolean(user.password),
    };

    return NextResponse.json({
      success: true,
      data: serialize(payload)
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Session expired or invalid' }, { status: 401 });
  }
}
