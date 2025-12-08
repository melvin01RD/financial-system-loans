import { db } from "@/lib/db";
import Link from "next/link";

export default async function PaymentsPage() {
    const loans = await db.loan.findMany({
        where: {
            estado: "ACTIVO",
        },
        include: {
            client: true,
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Pagos</h1>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Préstamos Activos</h2>
                <p className="text-gray-500 mb-6">Seleccione un préstamo para registrar un pago.</p>

                {loans.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                        <p className="text-gray-500">No hay préstamos activos pendientes de pago.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {loans.map((loan) => (
                            <div key={loan.id} className="border border-gray-200 dark:border-zinc-700 rounded-lg p-6 hover:shadow-md transition-shadow bg-card text-card-foreground">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-semibold text-lg">{loan.client.nombre_completo}</h3>
                                        <p className="text-sm text-gray-500">ID: {loan.id.slice(0, 8)}...</p>
                                    </div>
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                        {loan.estado}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Monto Original:</span>
                                        <span className="font-medium">RD$ {loan.monto_principal.toString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Saldo Restante:</span>
                                        <span className="font-medium text-blue-600">RD$ {loan.saldo_restante.toString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Cuota Mensual:</span>
                                        <span className="font-medium">RD$ {loan.cuota_mensual.toString()}</span>
                                    </div>
                                </div>

                                <Link
                                    href={`/prestamos/${loan.id}/pagar`}
                                    className="block w-full text-center bg-black hover:bg-zinc-800 text-white font-medium py-2 px-4 rounded-md transition-colors dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                                >
                                    Pagar Préstamo
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
