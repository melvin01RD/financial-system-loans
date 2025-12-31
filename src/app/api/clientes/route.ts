import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// 1. Esquema de validación estricto
const clienteSchema = z.object({
  nombre: z.string().trim().min(3, "Mínimo 3 caracteres"),
  apellido: z.string().trim().min(3, "Mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  telefono: z.string().length(10, "10 dígitos"),
  cedula: z.string().length(11, "11 dígitos"),
  direccion: z.string().optional(),
  password: z.string().min(6, "Password muy corto"),
  fecha_nacimiento: z.string(), // Recibimos el string del input date
});


export async function GET() {
  try {
    const clientes = await prisma.client.findMany({
      orderBy: { nombre: 'asc' }, 
      select: {
        id: true,
        nombre: true,
        apellido: true,
        cedula: true
      }
    })
    console.log(clientes)
    return NextResponse.json(clientes);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener clientes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validamos los datos con Zod
    const data = clienteSchema.parse(body);

    // Creamos el cliente en la base de datos (Neon)
    const cliente = await prisma.client.create({
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        telefono: data.telefono,
        cedula: data.cedula,
        direccion: data.direccion || '',
        password: data.password, 
        fecha_nacimiento: new Date(data.fecha_nacimiento), // Conversión necesaria para PostgreSQL
      },
    });

    return NextResponse.json(cliente, { status: 201 });

  } catch (error: any) {
    console.error('Error al crear cliente:', error);

    // A. Errores de validación de Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Error de validación', 
        detalles: error.issues.map(i => ({ 
          campo: i.path.join('.'), 
          mensaje: i.message 
        })) 
      }, { status: 400 });
    }

    // B. Errores de duplicidad de Prisma (Cédula o Email)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'La cédula o el correo ya están registrados.' },
        { status: 400 }
      );
    }

    // C. Otros errores internos
    return NextResponse.json(
      { error: 'Error interno del servidor al procesar el registro' }, 
      { status: 500 }
    );
  }
}