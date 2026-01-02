'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Loader2, MoreHorizontal } from "lucide-react";
import Link from 'next/link';

interface Client {
  id: string;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  estado: string;
}

export function RecentClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/clientes')
      .then((res) => res.json())
      .then((data) => {
        // Asumiendo que la API devuelve todos, cortamos los últimos 5
        // Si la API no ordena, lo hacemos aquí por seguridad
        // Pero idealmente la API debería soportar ?limit=5
        // Por ahora, tomamos los primeros 5 del array (asumiendo que vienen ordenados o son pocos)
        setClients(data.slice(0, 5));
      })
      .catch((error) => console.error("Error fetching clients:", error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="col-span-4 shadow-md border-t-4 border-blue-500">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Clientes Recientes
        </CardTitle>
        <Link href="/dashboard/clientes">
            <Button variant="outline" size="sm">Ver todos</Button>
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="flex justify-center py-10 text-blue-600">
                <Loader2 className="animate-spin h-8 w-8" />
            </div>
        ) : clients.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
                No hay clientes registrados aún.
            </div>
        ) : (
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Cédula</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acción</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {clients.map((client) => (
                <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.nombre} {client.apellido}</TableCell>
                    <TableCell className="font-mono text-xs">{client.cedula}</TableCell>
                    <TableCell className="font-mono text-xs">{client.telefono}</TableCell>
                    <TableCell>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 shadow-none border border-green-200">
                            ACTIVO
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        )}
      </CardContent>
    </Card>
  );
}
