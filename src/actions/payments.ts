'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { Decimal } from "@prisma/client/runtime/library" // Para manejar precisión de Decimal

// Constante para el ID del usuario logueado (temporalmente)
const TEMP_USER_ID = "TU_USER_ID"

export async function registerPayment(formData: FormData) {
    const loanId = formData.get("loanId") as string
    const montoTotalPagado = parseFloat(formData.get("montoTotalPagado") as string)

    if (!loanId || isNaN(montoTotalPagado) || montoTotalPagado <= 0) {
        return { success: false, message: "Monto inválido o ID de préstamo faltante." }
    }

    try {
        // 1. OBTENER INFORMACIÓN DEL PRÉSTAMO
        const loan = await db.loan.findUnique({
            where: { id: loanId },
        })

        if (!loan) {
            return { success: false, message: "Préstamo no encontrado." }
        }

        if (loan.estado !== "ACTIVO") {
            return { success: false, message: `El préstamo está en estado ${loan.estado} y no puede recibir pagos.` }
        }

        // Convertir a tipo Number para los cálculos
        const saldoRestante = loan.saldo_restante.toNumber()
        const tasaAnual = loan.tasa_interes_anual.toNumber()

        // Tasa mensual en decimal (ej: 15% / 12 / 100)
        const tasaMensual = tasaAnual / 12 / 100

        // 2. CÁLCULO CRÍTICO: ¿Cuánto va a interés y cuánto a capital?

        // Intereses que se deben generar en este periodo
        // Nota: Aquí se usa una simplificación. Un sistema real usaría el tiempo transcurrido o la cuota calculada.
        // Usaremos el interés simple sobre el saldo restante como base para un pago regular.
        let interesCalculado = saldoRestante * tasaMensual

        // Si el monto pagado es menor al interés, solo se cubre el interés (pago parcial)
        if (montoTotalPagado < interesCalculado) {
            interesCalculado = montoTotalPagado // Todo el pago se va a interés
            var aplicadoACapital = 0
        } else {
            // El pago cubre todo el interés y el excedente va a capital
            aplicadoACapital = montoTotalPagado - interesCalculado
        }

        // 3. ACTUALIZACIÓN DEL PRÉSTAMO
        const nuevoSaldoRestante = saldoRestante - aplicadoACapital
        const nuevoPlazoRestante = nuevoSaldoRestante <= 0 ? 0 : loan.plazo_restante_cuotas - 1 // Reducimos una cuota

        // Determinar nuevo estado
        const nuevoEstado = nuevoSaldoRestante <= 0 ? "LIQUIDADO" : "ACTIVO"


        // 4. TRANSACCIÓN ATÓMICA (Prisma)
        await db.$transaction(async (tx) => {

            // A. Crear el registro de Pago (Payment)
            await tx.payment.create({
                data: {
                    loanId: loanId,
                    monto_total_pagado: montoTotalPagado,
                    aplicado_a_intereses: interesCalculado,
                    aplicado_a_capital: aplicadoACapital,
                    tipo_pago: aplicadoACapital > 0 ? "CUOTA REGULAR" : "INTERESES SOLOS",
                    createdById: TEMP_USER_ID,
                },
            })

            // B. Actualizar el Préstamo (Loan)
            await tx.loan.update({
                where: { id: loanId },
                data: {
                    saldo_restante: nuevoSaldoRestante,
                    plazo_restante_cuotas: nuevoPlazoRestante,
                    estado: nuevoEstado,
                    updatedById: TEMP_USER_ID,
                },
            })
        })

        // 5. Devolver mensaje de éxito
        revalidatePath(`/prestamos/${loanId}`)
        return {
            success: true,
            message: `Pago de RD$${montoTotalPagado.toFixed(2)} registrado. Capital: RD$${aplicadoACapital.toFixed(2)}. Intereses: RD$${interesCalculado.toFixed(2)}. Nuevo Saldo: RD$${nuevoSaldoRestante.toFixed(2)}.`
        }

    } catch (error) {
        console.error("Error al registrar pago y actualizar préstamo:", error)
        return { success: false, message: "Error crítico al procesar el pago." }
    }
}