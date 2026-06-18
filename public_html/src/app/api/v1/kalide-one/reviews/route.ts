import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';
import { verifyToken } from '@/lib/auth';
import { serialize } from '@/lib/api-utils';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const professional_id = searchParams.get('professional_id');
  const project_id = searchParams.get('project_id');

  try {
    const where: any = {};
    if (professional_id) where.reviewee_id = BigInt(professional_id);
    if (project_id) where.project_id = BigInt(project_id);

    const reviews = await prisma.reviews_review.findMany({
      where,
      include: {
        users_user_reviews_review_reviewer_idTousers_user: {
          select: {
            first_name: true,
            last_name: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json(serialize(reviews));
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
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
    const body = await request.json();
    const { rating, comment, project_id, reviewee_id } = body;

    if (!project_id || !reviewee_id || !rating) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const newReview = await prisma.reviews_review.create({
      data: {
        rating: parseInt(rating),
        comment: comment || '',
        created_at: new Date(),
        reviewer_id: BigInt(decoded.user_id),
        reviewee_id: BigInt(reviewee_id),
        project_id: BigInt(project_id)
      }
    });

    // Update the professional's aggregate rating in marketplace_professionals
    const allReviews = await prisma.reviews_review.findMany({
      where: {
        reviewee_id: BigInt(reviewee_id)
      },
      select: {
        rating: true
      }
    });

    if (allReviews.length > 0) {
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await prisma.marketplace_professionals.updateMany({
        where: {
          user_id: BigInt(reviewee_id)
        },
        data: {
          rating: avgRating
        }
      });
    }

    return NextResponse.json(serialize(newReview), { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
