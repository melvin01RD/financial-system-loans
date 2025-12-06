'use server'

import { db } from "@/lib/db" // Crearemos este archivo en el paso 3
import { revalidatePath } from "next/cache"

// Definimos el tipo de datos que esperamos recibir
interface ClientData {
    nombre_completo: string
    telefono: string
    direccion?: string
    email?: string
}

export async function createClient(data: ClientData) {
    try {
        // Guardamos en la base de datos
        await db.client.create({
            data: {
                nombre_completo: data.nombre_completo,
                telefono: data.telefono,
                direccion: data.direccion,
                email: data.email,
            },
        })

        // Actualizamos la vista para que aparezca el nuevo cliente sin recargar
        revalidatePath("/clientes")
        return { success: true, message: "Cliente creado correctamente" }

    } catch (error) {
        console.error("Error creando cliente:", error)
        return { success: false, message: "Error al crear el cliente" }
    }
}