import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getBearerToken, verifyToken, hashPassword } from '@/lib/auth';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  role: z.enum(['admin', 'editor', 'viewer']).optional(),
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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const data = updateSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const updateData: { name?: string; email?: string; role?: 'admin' | 'editor' | 'viewer'; passwordHash?: string } = {
      ...(data.name ? { name: data.name } : {}),
      ...(data.email ? { email: data.email } : {}),
      ...(data.role ? { role: data.role } : {}),
    };

    if (data.password) {
      updateData.passwordHash = await hashPassword(data.password);
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0]?.message || 'Invalid input' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    await prisma.user.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true, data: { id: params.id } }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete user' }, { status: 500 });
  }
}
