'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { LoanStatus, PaymentType } from "@prisma/client"

export async function registerPayment(formData: FormData) {
    const loanId = formData.get("loanId") as string
    const montoTotalPagado = parseFloat(formData.get("montoTotalPagado") as string)

    if (!loanId || isNaN(montoTotalPagado) || montoTotalPagado <= 0) {
        return { success: false, message: "Monto inválido." }
    }

    try {
        // 1. OBTENER INFORMACIÓN DEL PRÉSTAMO
        const loan = await db.loan.findUnique({
            where: { id: loanId },
        })

        if (!loan) return { success: false, message: "Préstamo no encontrado." }
        if (loan.estado !== LoanStatus.ACTIVO) return { success: false, message: "Préstamo no activo." }

        // --- CÁLCULO SIMPLIFICADO TEMPORAL ---
        // (Más adelante conectaremos esto con la tabla de amortización para ser exactos)
        
        const saldoCapitalActual = loan.saldo_capital.toNumber()
        
        // Asumimos que todo lo que paga reduce capital (por ahora, para que funcione)
        let nuevoSaldo = saldoCapitalActual - montoTotalPagado
        let nuevoEstado: LoanStatus = LoanStatus.ACTIVO

        if (nuevoSaldo <= 0.5) { // Margen de error de centavos
            nuevoSaldo = 0
            nuevoEstado = LoanStatus.LIQUIDADO
        }

        // GUARDAR EN BD
        await db.$transaction(async (tx) => {
            // Crear el registro del pago
            await tx.payment.create({
                data: {
                    loanId: loanId,
                    monto_total_pagado: montoTotalPagado,
                    aplicado_a_capital: montoTotalPagado, // Simplificado
                    aplicado_a_intereses: 0,              // Simplificado
                    tipo_pago: PaymentType.CUOTA_REGULAR,
                },
            })

            // Actualizar el préstamo
            await tx.loan.update({
                where: { id: loanId },
                data: {
                    saldo_capital: nuevoSaldo,
                    estado: nuevoEstado,
                },
            })
        })

        revalidatePath(`/prestamos`)
        return { success: true, message: "Pago registrado exitosamente." }

    } catch (error) {
        console.error("Error pagos:", error)
        return { success: false, message: "Error interno al registrar el pago." }
    }
}