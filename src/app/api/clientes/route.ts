import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validamos contra tu schema.prisma real
const clienteSchema = z.object({
  nombre: z.string().min(2, "El nombre es muy corto"),
  apellido: z.string().min(3, "El apellido es muy corto"),
  email: z.email("Formato de correo inválido"),
  telefono: z.string().min(8),
  direccion: z.string().optional(),
  cedula: z.string().min(11, "La cédula debe tener 11 caracteres"),
});

export async function GET() {
  try {
    const clientes = await prisma.client.findMany({
      include: {
        loans: true, 
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(clientes);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener clientes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = clienteSchema.parse(body);

    const cliente = await prisma.client.create({
  data: {
    nombre: data.nombre,
    apellido: data.apellido,
    cedula: data.cedula,
    telefono: data.telefono,
    direccion: data.direccion,
    email: data.email,
    password: "una_password_temporal",
    fecha_nacimiento: new Date(),       
  },
});

    return NextResponse.json(cliente, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear cliente:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'El Email o la Cédula ya están registrados' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}