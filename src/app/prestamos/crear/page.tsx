import { db } from "@/lib/db"
import { LoanForm } from "./loan-form"

export default async function CrearPrestamoPage() {
    // Obtenemos la lista de clientes para el Select
    const clients = await db.client.findMany({
        select: { id: true, nombre_completo: true },
        orderBy: { nombre_completo: 'asc' }
    })

    return (
        <div className="container mx-auto py-10 max-w-2xl">
            <LoanForm clients={clients} />
        </div>
    )
}