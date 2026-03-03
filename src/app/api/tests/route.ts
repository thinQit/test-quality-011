import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

const statusEnum = z.enum(['draft', 'active', 'archived']);

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  q: z.string().optional().default(''),
  status: statusEnum.optional()
});

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: statusEnum.optional()
});

async function requireUser(request: NextRequest) {
  const token = getTokenFromHeader(request.headers.get('Authorization'));
  if (!token) return null;
  try {
    const payload = verifyToken(token);
    const userId = typeof payload.sub === 'string' ? payload.sub : null;
    if (!userId) return null;
    return await db.user.findUnique({ where: { id: userId } });
  } catch (_error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryObject = {
      page: searchParams.get('page') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? undefined,
      q: searchParams.get('q') ?? undefined,
      status: searchParams.get('status') ?? undefined
    };

    const parsed = listQuerySchema.parse(queryObject);

    const where = {
      ...(parsed.q ? { title: { contains: parsed.q, mode: 'insensitive' as const } } : {}),
      ...(parsed.status ? { status: parsed.status } : {})
    };

    const [items, total] = await Promise.all([
      db.test.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (parsed.page - 1) * parsed.pageSize,
        take: parsed.pageSize
      }),
      db.test.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items,
        total,
        page: parsed.page,
        pageSize: parsed.pageSize
      }
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Invalid query parameters' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to fetch tests' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createSchema.parse(body);

    const test = await db.test.create({
      data: {
        title: parsed.title,
        description: parsed.description,
        status: parsed.status ?? 'draft'
      }
    });

    return NextResponse.json({ success: true, data: test }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to create test' }, { status: 500 });
  }
}
