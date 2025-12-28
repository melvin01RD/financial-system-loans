'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { email } from "zod"

export async function createClient(formData: FormData) {
    const nombre = formData.get("nombre") as string
    const apellido = formData.get("apellido") as string
    const email = formData.get("email") as string
    const cedula = formData.get("cedula") as string
    const telefono = formData.get("telefono") as string
    const direccion = formData.get("direccion") as string

    if (!nombre || !apellido || !cedula || !telefono || !email) {
        return { success: false, message: "Nombre, apellido, cédula y teléfono son obligatorios" }
    }

    try {
        await prisma.client.create({
            data: {
                nombre:nombre,
                apellido: apellido,
                cedula: cedula,
                telefono: telefono,
                direccion: direccion,
                email: email,
                fecha_nacimiento: new Date(),
                password: "password",
                moneda: "DOP",
                estado: "ACTIVO",
            },
        })

        revalidatePath("/clientes")
        return { success: true, message: "Cliente creado" }
    } catch (error) {
        return { success: false, message: "Error al crear cliente" }
    }
}
