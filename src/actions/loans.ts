'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createLoan(formData: FormData) {
    const clientId = formData.get("clientId") as string
    const montoPrincipal = parseFloat(formData.get("montoPrincipal") as string)
    const tasaInteresAnual = parseFloat(formData.get("tasaInteresAnual") as string)
    const plazoMeses = parseInt(formData.get("plazoMeses") as string)
    const garantias = formData.get("garantias") as string

    if (!clientId || isNaN(montoPrincipal) || isNaN(tasaInteresAnual) || isNaN(plazoMeses)) {
        return { success: false, message: "Faltan campos obligatorios o son inválidos." }
    }

    // ----------------------------------------------------
    // LÓGICA DE AMORTIZACIÓN SIMPLE (Fórmula de pago fijo)
    // M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1]
    // i = tasa mensual (tasa anual / 12)
    // n = número de pagos (plazoMeses)
    // P = principal (montoPrincipal)
    // ----------------------------------------------------

    const tasaMensual = tasaInteresAnual / 12 / 100 // Tasa mensual en decimal (ej: 0.15/12/100)
    const factor = Math.pow((1 + tasaMensual), plazoMeses)

    let cuotaMensual = 0
    if (tasaMensual > 0) {
        cuotaMensual = montoPrincipal * (tasaMensual * factor) / (factor - 1)
    } else {
        cuotaMensual = montoPrincipal / plazoMeses
    }

    const cuotaRedondeada = parseFloat(cuotaMensual.toFixed(2))

    try {
        await db.loan.create({
            data: {
                clientId: clientId,
                monto_principal: montoPrincipal,
                tasa_interes_anual: tasaInteresAnual,
                plazo_meses: plazoMeses,
                cuota_mensual: cuotaRedondeada,
                saldo_restante: montoPrincipal, // Al inicio, el saldo restante es el principal
                plazo_restante_cuotas: plazoMeses,
                garantias: garantias,
                estado: "ACTIVO",
                // PENDIENTE: Aquí faltarían createdById y updatedById del usuario logueado.
                createdById: "TU_USER_ID", // TODO: Usar el ID del usuario logueado (puedes usar un UUID temporal por ahora)
                updatedById: "TU_USER_ID",
            },
        })

        revalidatePath("/prestamos")
        return { success: true, message: "Préstamo creado. Cuota mensual: " + cuotaRedondeada }
    } catch (error) {
        console.error("Error creando préstamo:", error)
        return { success: false, message: "Error al crear el préstamo." }
    }
}