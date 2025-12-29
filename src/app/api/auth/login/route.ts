import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword } from '@/lib/auth'; // Asegúrate que esta función exista
import { signToken } from '@/lib/jwt';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email("Email no válido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 1. Validar formato de entrada con Zod
    const { email, password } = loginSchema.parse(body);

    // 2. Buscar usuario en la DB (Faltaba esta línea en tu código)
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 3. Si no existe el usuario
    if (!user) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    // 4. Verificar contraseña (usando tu función de lib/auth)
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    // 5. Generar el token (IMPORTANTE: Con await porque es jose)
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // 6. Preparar la respuesta JSON
    const response = NextResponse.json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        role: user.role,
      }
    });

    // 7. Guardar el token en la COOKIE para el Middleware
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 horas
      path: '/',
    });

    return response;

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Datos inválidos', 
      }, { status: 400 });
    }
    
    console.error('Error Login:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}