import { db } from "@/lib/db";
import { Client } from "@prisma/client";
import { createClient } from "@/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, PlusCircle } from "lucide-react";

export default async function ClientesPage() {
    // 1. Obtenemos los clientes de la BD
    const clients: Client[] = await db.client.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8">

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Users className="w-8 h-8" />
                    Gestión de Clientes
                </h1>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* FORMULARIO DE REGISTRO */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg">Nuevo Cliente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form action={async (formData) => {
                            "use server"
                            await createClient(formData)
                        }} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nombre">Nombre Completo *</Label>
                                <Input id="nombre" name="nombre" placeholder="Ej. Juan Pérez" required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="telefono">Teléfono *</Label>
                                <Input id="telefono" name="telefono" placeholder="809-555-5555" required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" placeholder="juan@gmail.com" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="direccion">Dirección</Label>
                                <Input id="direccion" name="direccion" placeholder="Calle 1, Casa 2..." />
                            </div>

                            <Button type="submit" className="w-full">
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Registrar Cliente
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* LISTA DE CLIENTES */}
                <Card className="md:col-span-2">
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
                                            <TableCell className="font-medium">{client.nombre_completo}</TableCell>
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
        </div>
    );
}