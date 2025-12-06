import { db } from "@/lib/db";
import { DollarSign } from "lucide-react";
import { LoanForm } from "./loan-form";

export default async function CrearPrestamoPage() {
    // Obtenemos la lista de clientes para el Select
    const clients = await db.client.findMany({
        select: { id: true, nombre_completo: true },
        orderBy: { nombre_completo: 'asc' }
    });

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold flex items-center gap-2">
                <DollarSign className="w-8 h-8" />
                Nuevo Préstamo
            </h1>

            <LoanForm clients={clients} />
        </div>
    );
}