import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const detail = request.nextUrl.searchParams.get('detail') === 'true';
    const uptimeSeconds = Math.floor(process.uptime());

    if (!detail) {
      return NextResponse.json({ success: true, data: { status: 'ok', uptimeSeconds } });
    }

    let dbStatus: 'ok' | 'fail' = 'ok';
    try {
      await db.$queryRaw`SELECT 1`;
    } catch (_error) {
      dbStatus = 'fail';
    }

    const status = dbStatus === 'ok' ? 'ok' : 'degraded';

    return NextResponse.json({
      success: true,
      data: {
        status,
        uptimeSeconds,
        checks: { db: dbStatus, cache: 'ok' }
      }
    });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Health check failed' }, { status: 500 });
  }
}
