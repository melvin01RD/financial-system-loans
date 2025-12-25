import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  // Por ahora, deja pasar a todo el mundo para que puedas trabajar
  return NextResponse.next()
}

// Esto evita que el middleware afecte a archivos internos de Next.js
export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}