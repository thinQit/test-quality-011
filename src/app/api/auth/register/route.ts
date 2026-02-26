import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'editor', 'viewer']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already in use' }, { status: 400 });
    }

    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role ?? 'viewer',
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const token = signToken({
      sub: user.id,
      role: user.role === 'admin' ? 'admin' : 'customer',
      jti: `${user.id}-${Date.now()}`,
    });

    return NextResponse.json({ success: true, data: { user, token } }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0]?.message || 'Invalid input' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to register' }, { status: 500 });
  }
}
