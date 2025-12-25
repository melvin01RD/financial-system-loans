'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createClient(formData: FormData) {
    const nombre = formData.get("nombre") as string
    const cedula = formData.get("cedula") as string
    const telefono = formData.get("telefono") as string
    const direccion = formData.get("direccion") as string

    if (!nombre || !cedula || !telefono) {
        return { success: false, message: "Nombre, cédula y teléfono son obligatorios" }
    }

    try {
        await db.client.create({
            data: {
                nombre_completo: nombre,
                cedula: cedula,
                telefono: telefono,
                direccion: direccion,
            },
        })

        revalidatePath("/clientes")
        return { success: true, message: "Cliente creado" }
    } catch (error) {
        return { success: false, message: "Error al crear cliente" }
    }
}
