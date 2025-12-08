import { db } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, DollarSign } from "lucide-react";

export default async function PrestamosPage() {
    const loans = await db.loan.findMany({
        include: {
            client: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <DollarSign className="w-8 h-8" />
                    Gestión de Préstamos
                </h1>
                <Link href="/prestamos/crear">
                    <Button>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Nuevo Préstamo
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Listado de Préstamos ({loans.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Monto Principal</TableHead>
                                <TableHead>Saldo Restante</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loans.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                        No hay préstamos registrados aún.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                loans.map((loan) => (
                                    <TableRow key={loan.id}>
                                        <TableCell className="font-medium">{loan.client.nombre_completo}</TableCell>
                                        <TableCell>RD$ {loan.monto_principal.toNumber().toFixed(2)}</TableCell>
                                        <TableCell>RD$ {loan.saldo_restante.toNumber().toFixed(2)}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${loan.estado === 'ACTIVO' ? 'bg-green-100 text-green-700' :
                                                    loan.estado === 'VENCIDO' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {loan.estado}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Link href={`/prestamos/${loan.id}/pagar`} className="text-blue-600 underline hover:text-blue-800">
                                                Pagar
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
