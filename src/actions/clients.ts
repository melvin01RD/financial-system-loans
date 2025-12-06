'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createClient(formData: FormData) {
    const nombre = formData.get("nombre") as string
    const telefono = formData.get("telefono") as string
    const email = formData.get("email") as string
    const direccion = formData.get("direccion") as string

    if (!nombre || !telefono) {
        return { success: false, message: "Nombre y teléfono son obligatorios" }
    }

    try {
        await db.client.create({
            data: {
                nombre_completo: nombre,
                telefono: telefono,
                email: email,
                direccion: direccion,
            },
        })

        revalidatePath("/clientes")
        return { success: true, message: "Cliente creado" }
    } catch (error) {
        return { success: false, message: "Error al crear cliente" }
    }
}
