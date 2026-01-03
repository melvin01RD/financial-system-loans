import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'YAPRESTO_CLAVE_UNICA_2025'
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 🚀 1. GESTIÓN DE LA RAÍZ (/)
  // Si alguien entra a la URL principal, decidimos según su sesión
  if (pathname === '/') {
    if (token) {
      try {
        await jwtVerify(token, SECRET);
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } catch (e) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 🛡️ 2. PROTECCIÓN DEL DASHBOARD
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      await jwtVerify(token, SECRET);
      return NextResponse.next();
    } catch (error) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  // 🔑 3. PREVENCIÓN DE LOGIN DUPLICADO
  // Si ya tiene sesión activa e intenta ir a login, lo mandamos al dashboard
  if (pathname === '/login' && token) {
    try {
      await jwtVerify(token, SECRET);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (e) {
      // Si el token es basura, dejamos que vea el login
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

// 🎯 CONFIGURACIÓN DE RUTAS A VIGILAR
export const config = {
  matcher: ['/', '/dashboard/:path*', '/login',
 '/((?!api|_next/static|_next/image|favicon.ico).*)'
], 

};
