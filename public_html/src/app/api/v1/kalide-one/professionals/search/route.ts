import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';
import { serialize } from '@/lib/api-utils';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const query = searchParams.get('q') || '';
  const skills = searchParams.getAll('skills');
  const location = searchParams.get('location') || '';
  const rating_min = parseFloat(searchParams.get('rating_min') || '0');
  const experience_min = parseInt(searchParams.get('experience_min') || '0');
  const price_min = parseFloat(searchParams.get('price_min') || '0');
  const price_max = parseFloat(searchParams.get('price_max') || '10000');
  const verified_only = searchParams.get('verified_only') !== 'false';
  const sort_by = searchParams.get('sort_by') || 'rating';
  const sort_order = searchParams.get('sort_order') || 'desc';
  const page = parseInt(searchParams.get('page') || '1');
  const page_size = parseInt(searchParams.get('page_size') || '20');

  try {
    const where: any = {};

    if (verified_only) {
      where.is_verified = true;
    }

    if (location) {
      where.users_user = {
        OR: [
          { city: { contains: location } },
          { country: { contains: location } },
          { name: { contains: location } }
        ]
      };
    }

    if (rating_min > 0) {
      where.rating = { gte: rating_min };
    }

    if (experience_min > 0) {
      where.experience_years = { gte: experience_min };
    }

    where.hourly_rate = {
      gte: price_min,
      lte: price_max
    };

    if (skills.length > 0) {
      where.AND = skills.map(skill => ({
        skills: { contains: skill.toLowerCase() }
      }));
    }

    if (query) {
      const searchConditions = [
        { users_user: { name: { contains: query } } },
        { skills: { contains: query.toLowerCase() } }
      ];
      
      if (where.AND) {
        where.AND.push({ OR: searchConditions });
      } else {
        where.OR = searchConditions;
      }
    }

    const orderBy: any = {};
    if (sort_by === 'rating') {
      orderBy.rating = sort_order;
    } else if (sort_by === 'experience') {
      orderBy.experience_years = sort_order;
    } else if (sort_by === 'price') {
      orderBy.hourly_rate = sort_order;
    } else {
      orderBy.rating = 'desc';
    }

    const [professionals, total_count] = await Promise.all([
      prisma.marketplace_professionals.findMany({
        where,
        include: {
          users_user: {
            select: {
              id: true,
              name: true,
              first_name: true,
              last_name: true,
              email: true,
              city: true,
              country: true
            }
          }
        },
        orderBy,
        skip: (page - 1) * page_size,
        take: page_size
      }),
      prisma.marketplace_professionals.count({ where })
    ]);

    return NextResponse.json({
      results: serialize(professionals),
      total_count,
      page,
      page_size,
      total_pages: Math.ceil(total_count / page_size),
      filters_applied: {
        query,
        skills,
        location,
        rating_min,
        experience_min,
        price_range: `${price_min}-${price_max}`,
        verified_only,
        sort_by,
        sort_order
      }
    });
  } catch (error) {
    console.error('Error searching professionals:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
