import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Usamos z.coerce para transformar el texto del formulario en números reales
const evaluacionSchema = z.object({
  clienteId: z.string().min(1),
  ingresosMensuales: z.coerce.number().positive(),
  gastosMensuales: z.coerce.number().min(0),
  porcentajeEndeudamiento: z.coerce.number().min(1).max(100).default(40),
  fuenteIngresos: z.string().optional(), // Permitir campo opcional
  garantia: z.string().optional(),       // Permitir campo opcional
  observaciones: z.string().optional(),  // Permitir campo opcional
});


// Agrega esto en src/app/api/evaluaciones/route.ts

export async function GET() {
  try {
    const evaluaciones = await prisma.evaluacion.findMany({
      include: {
        cliente: true // Para traer nombre y cédula del cliente
      },
      orderBy: {
        createdAt: 'desc' // Las más recientes primero
      }
    });
    return NextResponse.json(evaluaciones);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener historial" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validData = evaluacionSchema.parse(body);

    // CORRECCIÓN: Usar 'client' (como en tu schema) y no 'cliente'
    const clienteExistente = await prisma.client.findUnique({
      where: { id: validData.clienteId },
    });

    if (!clienteExistente) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    const ingresoDisponible = validData.ingresosMensuales - validData.gastosMensuales;
    const cuotaMaxima = ingresoDisponible > 0 ? ingresoDisponible * (validData.porcentajeEndeudamiento / 100) : 0;

    const evaluacion = await prisma.evaluacion.create({
      data: {
        ...validData, // Esto mete clienteId, ingresos, gastos Y los 3 campos nuevos
        capacidadPago: ingresoDisponible,
        cuotaMaxima: cuotaMaxima,
      },
      include: { cliente: true }
    });


    return NextResponse.json(evaluacion, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      // CAMBIAMOS .errors por .issues para quitar el rojo de VS Code
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 });
    }
    console.error('Error en Evaluación:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}