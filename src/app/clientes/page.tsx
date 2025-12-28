import { prisma } from "@/lib/prisma";
import { Client } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, PlusCircle } from "lucide-react";
import Link from "next/link";

export default async function ClientesPage() {
    // 1. Obtenemos los clientes de la BD
    const clients: Client[] = await prisma.client.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8">

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Users className="w-8 h-8" />
                    Gestión de Clientes
                </h1>
                <Link href="/clientes/crear">
                    <Button>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Nuevo Cliente
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Listado de Clientes ({clients.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Teléfono</TableHead>
                                <TableHead>Dirección</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clients.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                                        No hay clientes registrados aún.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                clients.map((client) => (
                                    <TableRow key={client.id}>
                                        <TableCell className="font-medium">{client.nombre}</TableCell>
                                        <TableCell>{client.telefono}</TableCell>
                                        <TableCell>{client.direccion || "-"}</TableCell>
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