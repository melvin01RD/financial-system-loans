import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { PaymentForm } from "@/components/payment-form"; 
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function PagarPage({ params }: PageProps) {
    const { id } = await params;

    const loan = await db.loan.findUnique({
        where: { id },
        include: { 
            client: true 
        }
    });

    if (!loan) {
        notFound();
    }

    // Preparamos los datos limpios para el componente
    // 1. EL IMPORT (Línea 3 aproximadamente)
// Asegúrate de que esté en MINÚSCULAS


// 2. El mapeo de datos (loanData)
// Reemplaza tu bloque de loanData por este:
const loanData = {
    id: loan.id,
    // Usamos Number() por si el casting de Prisma falla
    saldo_capital: Number(loan.saldo_capital), 
    cuota_fija: Number(loan.cuota_fija),      
    estado: loan.estado,
    client: { 
        nombre_completo: loan.client.nombre_completo 
    }
};
    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            <Link 
                href="/prestamos" 
                className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Volver al listado
            </Link>

            <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">Procesar Pago</h1>
                <p className="text-gray-500">
                    Registra el ingreso de dinero para amortizar el préstamo.
                </p>
            </div>

            {/* Renderizamos el formulario pasándole los datos */}
            <PaymentForm loan={loanData} />
        </div>
    );
}