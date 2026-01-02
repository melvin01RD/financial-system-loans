'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MoreVertical, Eye, Edit, DollarSign } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";

export default function LoansTable({ initialLoans }: { initialLoans: any[] }) {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');

  const filteredLoans = initialLoans.filter(loan => {
    // Check if client exists just in case strict mode is weird, but schema says it's required
    const clientName = loan.client ? `${loan.client.nombre} ${loan.client.apellido || ''}` : '';
    const clientCedula = loan.client ? loan.client.cedula : '';
    
    const matchesSearch = clientName.toLowerCase().includes(busqueda.toLowerCase()) || 
                          clientCedula.includes(busqueda);
    const matchesStatus = filtroEstado === 'TODOS' || loan.estado === filtroEstado;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Buscar por cliente o cédula..." 
            className="pl-10" 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
           {['TODOS', 'ACTIVO', 'VENCIDO', 'LIQUIDADO'].map((estado) => (
             <Button 
               key={estado}
               variant={filtroEstado === estado ? "default" : "outline"}
               onClick={() => setFiltroEstado(estado)}
               size="sm"
             >
               {estado}
             </Button>
           ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Monto Principal</TableHead>
                <TableHead>Frecuencia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLoans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                    No se encontraron préstamos.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLoans.map((loan) => (
                  <TableRow key={loan.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="font-medium text-slate-900">{loan.client?.nombre} {loan.client?.apellido}</div>
                      <div className="text-xs text-slate-500">{loan.client?.cedula}</div>
                    </TableCell>
                    <TableCell className="font-bold">RD$ {Number(loan.monto_principal).toLocaleString()}</TableCell>
                    <TableCell><Badge variant="outline">{loan.frecuencia_pago}</Badge></TableCell>
                    <TableCell>
                      <Badge className={
                        loan.estado === 'ACTIVO' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 
                        loan.estado === 'VENCIDO' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 
                        'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }>
                        {loan.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/creditos/${loan.id}/cuotas`)}>
                            <Eye className="mr-2 h-4 w-4" /> Ver Cuotas
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/creditos/${loan.id}/editar`)}>
                            <Edit className="mr-2 h-4 w-4" /> Gestionar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-green-600 focus:text-green-700" onClick={() => router.push(`/dashboard/pagos/nuevo?loanId=${loan.id}`)}>
                            <DollarSign className="mr-2 h-4 w-4" /> Cobrar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
