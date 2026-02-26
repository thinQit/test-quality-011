import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const detail = url.searchParams.get('detail') === 'true';
  const uptimeSeconds = Math.floor(process.uptime());

  if (!detail) {
    return NextResponse.json({ success: true, data: { status: 'ok', uptimeSeconds } }, { status: 200 });
  }

  let dbStatus: 'ok' | 'unavailable' = 'ok';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    dbStatus = 'unavailable';
  }

  const status = dbStatus === 'ok' ? 'ok' : 'degraded';
  return NextResponse.json({ success: true, data: { status, uptimeSeconds, db: dbStatus } }, { status: 200 });
}
