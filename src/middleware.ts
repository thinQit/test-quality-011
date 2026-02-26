import { NextRequest, NextResponse } from 'next/server';
import { getBearerToken, verifyToken } from '@/lib/auth';

const protectedPaths = ['/api/test-items', '/api/users', '/api/auth/me'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (!isProtected) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/test-items') && request.method === 'GET') {
    return NextResponse.next();
  }

  const token = getBearerToken(request.headers.get('authorization'));
  if (!token) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = verifyToken(token);
    const headers = new Headers(request.headers);
    headers.set('x-user-id', payload.sub);
    headers.set('x-user-role', payload.role);

    return NextResponse.next({ request: { headers } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
  }
}

export const config = {
  matcher: ['/api/:path*'],
};
