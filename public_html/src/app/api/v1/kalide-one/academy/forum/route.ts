import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { serialize } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where = category ? { category } : {};

    const posts = await prisma.services_knowledgeforumpost.findMany({
      where,
      include: {
        users_user: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 50
    });

    return NextResponse.json({
      success: true,
      data: serialize(posts)
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to fetch forum posts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, category, author_id } = body;

    const post = await prisma.services_knowledgeforumpost.create({
      data: {
        title,
        content,
        category,
        upvotes: 0,
        created_at: new Date(),
        author_id: BigInt(author_id)
      }
    });

    return NextResponse.json({
      success: true,
      data: serialize(post)
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to create forum post' }, { status: 500 });
  }
}
