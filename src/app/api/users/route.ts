import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getBearerToken, verifyToken, hashPassword } from '@/lib/auth';

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'editor', 'viewer']).default('viewer'),
});

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});

function requireAdmin(request: NextRequest) {
  const token = getBearerToken(request.headers.get('authorization'));
  if (!token) return { ok: false as const, error: 'Unauthorized', status: 401 };
  try {
    const payload = verifyToken(token);
    if (payload.role !== 'admin') {
      return { ok: false as const, error: 'Forbidden', status: 403 };
    }
    return { ok: true as const, userId: payload.sub };
  } catch (error) {
    return { ok: false as const, error: 'Invalid token', status: 401 };
  }
}

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const query = querySchema.parse(params);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count(),
    ]);

    return NextResponse.json(
      { success: true, data: { items: users, total, page: query.page, pageSize: query.pageSize } },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0]?.message || 'Invalid query' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const data = createSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already in use' }, { status: 400 });
    }

    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0]?.message || 'Invalid input' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 500 });
  }
}
