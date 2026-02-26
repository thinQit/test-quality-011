import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { signToken, verifyPassword } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const passwordValid = await verifyPassword(data.password, user.passwordHash);
    if (!passwordValid) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({
      sub: user.id,
      role: user.role === 'admin' ? 'admin' : 'customer',
      jti: `${user.id}-${Date.now()}`,
    });

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json({ success: true, data: { user: safeUser, token } }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0]?.message || 'Invalid input' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to login' }, { status: 500 });
  }
}
