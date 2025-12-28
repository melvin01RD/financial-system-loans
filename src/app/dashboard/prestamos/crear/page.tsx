import { prisma } from "@/lib/prisma";
import { LoanForm } from "./loan-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";


export default async function CrearPrestamoPage() {
    try {
        const clients = await prisma.client.findMany({
            select: { id: true, nombre_completo: true },
            orderBy: { nombre_completo: 'asc' },
        });

        return (
            <div className="p-8 max-w-3xl mx-auto space-y-6">
                <Link href="/dashboard/prestamos" className="flex items-center text-blue-600">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Volver
                </Link>
                <h1 className="text-3xl font-bold">Nuevo Préstamo</h1>
                <LoanForm clients={clients} />
            </div>
        );
    } catch (error) {
        return <div className="p-10 text-red-500">Error: Revisa la conexión con Neon.</div>;
    }
}