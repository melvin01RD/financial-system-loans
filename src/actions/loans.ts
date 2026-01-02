'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { LoanStatus, PaymentFrequency } from "@prisma/client"
import { auth } from "@/auth"

// 1. MOTOR DE CÁLCULO
function calcularAmortizacion(
    principal: number,
    tasaAnual: number,
    plazo: number,
    frecuencia: PaymentFrequency,
    fechaInicio: Date
) {
    let periodosPorAnio = 12
    let diasEntrePagos = 30

    switch (frecuencia) {
        case "SEMANAL":
            periodosPorAnio = 52
            diasEntrePagos = 7
            break
        case "QUINCENAL":
            periodosPorAnio = 24
            diasEntrePagos = 15
            break
        case "MENSUAL":
            periodosPorAnio = 12
            diasEntrePagos = 30
            break
    }

    const tasaPeriodica = (tasaAnual / 100) / periodosPorAnio
    
    // Fórmula de Cuota Fija (PMT)
    const numerador = principal * tasaPeriodica * Math.pow(1 + tasaPeriodica, plazo)
    const denominador = Math.pow(1 + tasaPeriodica, plazo) - 1
    const cuota = numerador / denominador

    const tabla = []
    let saldo = principal
    let fechaActual = new Date(fechaInicio)

    for (let i = 1; i <= plazo; i++) {
        fechaActual.setDate(fechaActual.getDate() + diasEntrePagos)
        
        const interes = saldo * tasaPeriodica
        const capital = cuota - interes
        saldo -= capital
        
        if (saldo < 0) saldo = 0

        tabla.push({
            numero_cuota: i,
            fecha_vencimiento: new Date(fechaActual),
            monto_cuota: cuota,
            capital_cuota: capital,
            interes_cuota: interes,
            saldo_pendiente: saldo,
        })
    }

    return { cuotaFija: cuota, tabla }
}

// 2. SERVER ACTION PRINCIPAL
export async function createLoan(formData: FormData) {
    const clientId = formData.get("clientId") as string
    const montoPrincipal = parseFloat(formData.get("montoPrincipal") as string)
    const tasaInteresAnual = parseFloat(formData.get("tasaInteresAnual") as string)
    
    // Convertimos el input del formulario al nombre de la BD
    const plazoCantidad = parseInt(formData.get("plazoMeses") as string);
    const frecuencia = (formData.get("frecuencia") as PaymentFrequency) || "MENSUAL" 
    const garantias = formData.get("garantias") as string

    if (!clientId || isNaN(montoPrincipal) || isNaN(tasaInteresAnual) || isNaN(plazoCantidad)) {
        return { success: false, message: "Datos inválidos. Revise los campos numéricos." }
    }

    try {
        // --- OBTENER USUARIO AUTENTICADO ---
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, message: "Usuario no autenticado." }
        }
        const userId = session.user.id

        // Calcular tabla de amortización
        const resultado = calcularAmortizacion(
            montoPrincipal,
            tasaInteresAnual,
            plazoCantidad,
            frecuencia,
            new Date()
        )

        // 3. GUARDAR EN BD (USANDO NOMBRES EXACTOS DE PRISMA)
        await prisma.loan.create({
            data: {
                clientId,
                monto_principal: montoPrincipal,
                tasa_interes_anual: tasaInteresAnual,
                plazo_cantidad: plazoCantidad,      
                frecuencia_pago: frecuencia,        
                cuota_fija: resultado.cuotaFija,    
                saldo_capital: montoPrincipal,      
                saldo_interes: 0,                   
                estado: LoanStatus.ACTIVO,
                garantias,
                createdById: userId,
                
        
                amortizationSchedule: {
                    create: resultado.tabla.map((fila) => ({
                        numero_cuota: fila.numero_cuota,
                        fecha_vencimiento: fila.fecha_vencimiento,
                        monto_cuota: fila.monto_cuota,
                        capital_cuota: fila.capital_cuota,
                        interes_cuota: fila.interes_cuota,
                        saldo_pendiente: fila.saldo_pendiente,
                        estado: "PENDIENTE"
                    }))
                }
            }
        })

        revalidatePath("/prestamos")
        return { 
            success: true, 
            message: `Préstamo creado con éxito.` 
        }

    } catch (error) {
        console.error("Error creando préstamo:", error)
        return { success: false, message: "Error interno al procesar el préstamo." }
    }
}

// 3. UPDATE LOAN ACTION
export async function updateLoan(loanId: string, formData: FormData) {
    const monto = parseFloat(formData.get("monto") as string)
    const plazo = parseInt(formData.get("plazoMeses") as string)
    const fechaInicio = new Date(formData.get("fechaInicio") as string)
    const estado = formData.get("estado") as LoanStatus

    if (isNaN(monto) || isNaN(plazo)) {
        return { success: false, message: "Datos inválidos" }
    }

    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, message: "No autorizado" }
        }

        // Recalcular amortización si cambiaron los datos financieros
        // Nota: Esto es simplificado. En un sistema real, cambiar un préstamo activo es complejo.
        // Asumimos que se puede editar si está en borrador o si se fuerza el recálculo.
        
        // Para este entregable, solo actualizamos los campos básicos
        await prisma.loan.update({
            where: { id: loanId },
            data: {
                monto_principal: monto,
                plazo_cantidad: plazo,
                fecha_desembolso: fechaInicio,
                estado: estado,
                updatedById: session.user.id
            }
        })

        revalidatePath(`/dashboard/creditos/${loanId}/editar`)
        revalidatePath(`/dashboard/creditos/${loanId}/cuotas`)
        return { success: true, message: "Crédito actualizado correctamente" }
    } catch (error) {
        console.error("Error actualizando préstamo:", error)
        return { success: false, message: "Error al actualizar el préstamo" }
    }
}