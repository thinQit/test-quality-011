import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
});

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const item = await prisma.testItem.findUnique({ where: { id: params.id } });
    if (!item) {
      return NextResponse.json({ success: false, error: 'Test item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: item }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch test item' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const data = updateSchema.parse(body);

    const item = await prisma.testItem.findUnique({ where: { id: params.id } });
    if (!item) {
      return NextResponse.json({ success: false, error: 'Test item not found' }, { status: 404 });
    }

    const updated = await prisma.testItem.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0]?.message || 'Invalid input' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to update test item' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const item = await prisma.testItem.findUnique({ where: { id: params.id } });
    if (!item) {
      return NextResponse.json({ success: false, error: 'Test item not found' }, { status: 404 });
    }

    await prisma.testItem.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true, data: { id: params.id } }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete test item' }, { status: 500 });
  }
}
