import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ScheduleStatus, PaymentType } from '@prisma/client';

const paymentSchema = z.object({
  loanId: z.string().uuid("ID de préstamo inválido"),
  monto: z.number().min(1, "El monto debe ser mayor a 0"),
  tipoPago: z.enum(['CUOTA_REGULAR', 'ABONO_CAPITAL', 'CANCELACION_TOTAL']).default('CUOTA_REGULAR')
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 1. Validación
    const result = paymentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Datos inválidos", detalles: result.error.format() }, { status: 400 });
    }

    const { loanId, monto, tipoPago } = result.data;
    
    // 2. Obtener Usuario ADMIN (Fallback)
    const adminUser = await prisma.user.findFirst();

    // 3. Transacción Lógica de Cobro
    const paymentResult = await prisma.$transaction(async (tx) => {
      // A. Obtener Préstamo y Cuotas Pendientes (Ordenadas por fecha)
      const loan = await tx.loan.findUnique({
        where: { id: loanId },
        include: { 
          amortizationSchedule: {
            where: { estado: { in: ['PENDIENTE', 'PARCIAL', 'VENCIDO'] } },
            orderBy: { numero_cuota: 'asc' }
          }
        }
      });

      if (!loan) throw new Error("Préstamo no encontrado");

      let remainingPayment = monto;
      let appliedInterest = 0;
      let appliedCapital = 0;

      // B. Waterfall (Cascada): Pagar cuotas más antiguas primero
      for (const cuota of loan.amortizationSchedule) {
        if (remainingPayment <= 0) break;

        const saldoPendiente = parseFloat(cuota.saldo_pendiente.toString());
        
        // Determinar cuánto se paga de esta cuota
        const pagoParaEstaCuota = Math.min(saldoPendiente, remainingPayment);
        
        // Actualizar estado de la cuota
        const nuevoSaldo = saldoPendiente - pagoParaEstaCuota;
        let nuevoEstado: ScheduleStatus = cuota.estado;
        
        if (nuevoSaldo <= 0.01) nuevoEstado = 'PAGADO'; // Margen de error flotante
        else nuevoEstado = 'PARCIAL';

        // Actualizar la cuota en BD
        await tx.amortizationSchedule.update({
          where: { id: cuota.id },
          data: {
            saldo_pendiente: nuevoSaldo,
            estado: nuevoEstado
          }
        });

        // Distribuir lógica contable simple (Prioridad Proporcional o Interés primero?)
        // Para simpleza, asumimos distribución proporcional basada en la cuota original
        // O simplemente acumulamos 'applied' totals para el registro del pago.
        // En Interés Simple/Flat, el "Capital" e "Interes" son fijos por cuota.
        // Vamos a asumir que lo pagado se distribuye proporcionalmente segun la estructura de la cuota.
        // Pero para el registro de Payment, lo más importante es el TOTAL pagado.
        
        remainingPayment -= pagoParaEstaCuota;
        
        // Estimación simple para el registro (no afecta contabilidad estricta si no se requiere)
        // Si pagamos X, asumimos que parte cubre interés y parte capital de esa cuota.
        const totalCuotaOrg = parseFloat(cuota.monto_cuota.toString());
        const interesCuotaOrg = parseFloat(cuota.interes_cuota.toString());
        const porcInteres = totalCuotaOrg > 0 ? interesCuotaOrg / totalCuotaOrg : 0;
        
        appliedInterest += pagoParaEstaCuota * porcInteres;
        appliedCapital += pagoParaEstaCuota * (1 - porcInteres);
      }

      // C. Actualizar Saldos del Préstamo Header
      const nuevoSaldoCapital = parseFloat(loan.saldo_capital.toString()) - appliedCapital;
      const nuevoSaldoInteres = parseFloat(loan.saldo_interes.toString()) - appliedInterest;

      await tx.loan.update({
        where: { id: loanId },
        data: {
          saldo_capital: Math.max(0, nuevoSaldoCapital),
          saldo_interes: Math.max(0, nuevoSaldoInteres),
          estado: nuevoSaldoCapital <= 10 && nuevoSaldoInteres <= 10 ? 'LIQUIDADO' : loan.estado
        }
      });

      // D. Crear Registro de Pago
      const nuevoPago = await tx.payment.create({
        data: {
          loanId,
          monto_total_pagado: monto,
          aplicado_a_capital: appliedCapital,
          aplicado_a_intereses: appliedInterest,
          aplicado_a_mora: 0, // Mora no implementada aún
          tipo_pago: tipoPago as PaymentType,
          createdById: adminUser?.id
        }
      });

      return nuevoPago;
    });

    return NextResponse.json(paymentResult, { status: 201 });

  } catch (error: any) {
    console.error("Error al procesar cobro:", error);
    return NextResponse.json({ error: error.message || "Error del servidor" }, { status: 500 });
  }
}
