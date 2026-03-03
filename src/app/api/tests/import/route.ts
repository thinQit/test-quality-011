import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

const allowedStatuses = new Set(['draft', 'active', 'archived']);

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

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'CSV file is required' }, { status: 400 });
    }

    const text = await file.text();
    const rows = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'CSV is empty' }, { status: 400 });
    }

    const header = rows[0].split(',').map((col) => col.trim().toLowerCase());
    const titleIndex = header.indexOf('title');
    const descriptionIndex = header.indexOf('description');
    const statusIndex = header.indexOf('status');

    if (titleIndex === -1) {
      return NextResponse.json({ success: false, error: 'CSV must include title column' }, { status: 400 });
    }

    let imported = 0;
    const errors: { row: number; message: string }[] = [];

    for (let i = 1; i < rows.length; i += 1) {
      const values = rows[i].split(',').map((value) => value.trim());
      const title = values[titleIndex];
      const description = descriptionIndex >= 0 ? values[descriptionIndex] || undefined : undefined;
      const statusValue = statusIndex >= 0 ? values[statusIndex] : undefined;
      const status = statusValue && allowedStatuses.has(statusValue) ? statusValue : 'draft';

      if (!title) {
        errors.push({ row: i + 1, message: 'Title is required' });
        continue;
      }

      try {
        await db.test.create({
          data: {
            title,
            description,
            status
          }
        });
        imported += 1;
      } catch (_error) {
        errors.push({ row: i + 1, message: 'Failed to import row' });
      }
    }

    return NextResponse.json({ success: true, data: { imported, errors } });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Import failed' }, { status: 500 });
  }
}
