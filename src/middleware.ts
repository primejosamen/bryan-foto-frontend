import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (process.env.MAINTENANCE_MODE === 'true') {
    // Permitir assets estáticos y la propia ruta de mantenimiento
    if (
      request.nextUrl.pathname.startsWith('/_next') ||
      request.nextUrl.pathname === '/maintenance'
    ) {
      return NextResponse.next();
    }
    return NextResponse.rewrite(new URL('/maintenance', request.url));
  }
  return NextResponse.next();
}
