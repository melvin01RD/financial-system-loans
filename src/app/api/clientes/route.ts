import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// 1. Esquema de validación AJUSTADO (Más flexible)
const clienteSchema = z.object({
  nombre: z.string().trim().min(2, "Nombre muy corto"),
  apellido: z.string().trim().optional().or(z.string().min(2)),
  email: z.string().email("Email inválido"),
  // Quitamos .length() estricto para que acepte guiones y los limpie luego
  telefono: z.string().min(10, "Mínimo 10 dígitos"),
  cedula: z.string().min(11, "Mínimo 11 dígitos"), 
  direccion: z.string().optional(),
  password: z.string().min(6, "Password mínimo 6 caracteres").default("cliente123"),
  fecha_nacimiento: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("📥 DATOS RECIBIDOS DEL FRONTEND:", body);

    // Intentamos validar pero capturamos el error específico de cada campo
    const result = clienteSchema.safeParse(body);
    
    if (!result.success) {
      console.log("❌ ERROR DE VALIDACIÓN ZOD:", result.error.format());
      return NextResponse.json({ 
        error: "Datos inválidos", 
        detalles: result.error.format() 
      }, { status: 400 });
    }

    // Si pasa, intentamos guardar
    const cliente = await prisma.client.create({
      data: {
        ...result.data,
        fecha_nacimiento: new Date(result.data.fecha_nacimiento),
      },
    });

    return NextResponse.json(cliente, { status: 201 });

  } catch (error: any) {
    console.error('🔥 ERROR CRÍTICO EN EL SERVIDOR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
