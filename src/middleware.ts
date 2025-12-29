import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'YAPRESTO_CLAVE_UNICA_2025'
);

export async function middleware(request: NextRequest) {
  // 1. Intentamos agarrar el token de las cookies
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 2. Si el usuario intenta ir al DASHBOARD
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      console.log("🚫 Sin token, rebotando al login");
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Verificamos si el token es real y no ha expirado
      await jwtVerify(token, SECRET);
      return NextResponse.next();
    } catch (error) {
      console.log("🚫 Token inválido o expirado, rebotando...");
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token'); // Limpiamos la basura
      return response;
    }
  }

  // 3. Si el usuario ya está logueado e intenta ir al LOGIN, lo mandamos al dashboard
  if (pathname === '/login' && token) {
    try {
      await jwtVerify(token, SECRET);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (e) {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

// Rutas que el Middleware va a vigilar
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};