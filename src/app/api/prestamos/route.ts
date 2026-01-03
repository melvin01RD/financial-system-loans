import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ScheduleStatus } from '@prisma/client';
import { z } from 'zod';
import { calculateAmortization } from '@/lib/finance-utils';

const loanSchema = z.object({
  clientId: z.string().uuid("ID de cliente inválido"),
  evaluacionId: z.string().optional(),
  monto: z.number().min(1, "El monto debe ser mayor a 0"),
  tasa: z.number().min(0, "La tasa no puede ser negativa"),
  cuotas: z.number().int().min(1, "Mínimo 1 cuota"),
  frecuencia: z.enum(['SEMANAL', 'QUINCENAL', 'MENSUAL']),
  garantia: z.string().optional()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 1. Validación de Entrada (Zod)
    const result = loanSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ 
        error: "Datos inválidos", 
        detalles: result.error.format() 
      }, { status: 400 });
    }

    const { clientId, evaluacionId, monto, tasa, cuotas, frecuencia, garantia } = result.data;

    // 2. Obtener Usuario ADMIN para `createdById` (Evitar error 500)
    const adminUser = await prisma.user.findFirst();
    if (!adminUser) {
        return NextResponse.json({ error: "No hay usuarios registrados en el sistema para asociar al préstamo." }, { status: 500 });
    }

    // 3. Cálculos Financieros (Fuente de Verdad Única)
    const amortization = calculateAmortization(monto, tasa, cuotas, frecuencia);

    // 4. Transacción Atómica
    const resultado = await prisma.$transaction(async (tx) => {
      
      // A. Crear el Préstamo Header
      const nuevoPrestamo = await tx.loan.create({
        data: {
          clientId,
          evaluacionId,
          monto_principal: monto,
          tasa_interes_anual: tasa,
          plazo_cantidad: cuotas,
          frecuencia_pago: frecuencia,
          saldo_capital: monto,
          saldo_interes: amortization.totalInterest,
          cuota_fija: amortization.quotaAmount,
          garantias: garantia,
          estado: 'ACTIVO',
          createdById: adminUser.id
        }
      });

      // B. Insertar Tabla de Amortización
      const cuotasData = amortization.schedule.map(item => ({
         loanId: nuevoPrestamo.id,
         numero_cuota: item.number,
         fecha_vencimiento: item.date,
         monto_cuota: item.amount,
         capital_cuota: item.principal,
         interes_cuota: item.interest,
         saldo_pendiente: item.balance,
         estado: ScheduleStatus.PENDIENTE
      }));

      await tx.amortizationSchedule.createMany({
        data: cuotasData
      });

      return nuevoPrestamo;
    });

    return NextResponse.json(resultado, { status: 201 });

  } catch (error: any) {
    console.error("Error al crear préstamo:", error);
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
  }
}
