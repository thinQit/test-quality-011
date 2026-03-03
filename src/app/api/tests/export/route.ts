import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

const allowedStatuses = new Set(['draft', 'active', 'archived']);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const statusParam = searchParams.get('status') || undefined;
    const status = statusParam && allowedStatuses.has(statusParam) ? statusParam : undefined;

    const where = {
      ...(q ? { title: { contains: q, mode: 'insensitive' as const } } : {}),
      ...(status ? { status } : {})
    };

    const tests = await db.test.findMany({ where, orderBy: { createdAt: 'desc' } });
    const header = ['id', 'title', 'description', 'status', 'createdAt', 'updatedAt'].join(',');
    const rows = tests.map((test) => [
      test.id,
      test.title,
      test.description ?? '',
      test.status,
      test.createdAt.toISOString(),
      test.updatedAt.toISOString()
    ].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','));

    const csv = [header, ...rows].join('\n');

    return NextResponse.json({
      success: true,
      data: {
        csv,
        filename: 'tests.csv'
      }
    });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Export failed' }, { status: 500 });
  }
}
