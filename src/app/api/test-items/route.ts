import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
});

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  q: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  sortBy: z.enum(['createdAt', 'name', 'status']).default('createdAt'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
});

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const query = querySchema.parse(params);

    const where = {
      ...(query.q ? { name: { contains: query.q, mode: 'insensitive' as const } } : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.testItem.findMany({
        where,
        orderBy: { [query.sortBy]: query.sortDir },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.testItem.count({ where }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          items,
          total,
          page: query.page,
          pageSize: query.pageSize,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0]?.message || 'Invalid query' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to fetch test items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createSchema.parse(body);

    const item = await prisma.testItem.create({
      data: {
        name: data.name,
        description: data.description,
        status: data.status ?? 'draft',
      },
    });

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0]?.message || 'Invalid input' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to create test item' }, { status: 500 });
  }
}
