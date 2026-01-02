'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Search, Receipt } from "lucide-react";

export default function NuevoPagoPage() {
  const [cedula, setCedula] = useState('');
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Registrar Cobro</h1>
      <Card>
        <CardHeader className="bg-green-50">
          <CardTitle className="text-green-800 flex items-center gap-2">
            <Search size={20} /> Buscar Préstamo por Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label>Cédula del Cliente</Label>
              <Input 
                placeholder="001-0000000-0" 
                value={cedula} 
                onChange={(e) => setCedula(e.target.value)} 
              />
            </div>
            <Button className="mt-8 bg-green-600 hover:bg-green-700">
              Buscar Cuotas
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-50">
        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Cuotas Pendientes</CardTitle></CardHeader>
          <CardContent className="h-40 flex items-center justify-center border-2 border-dashed">
            Busca un cliente para ver sus pagos pendientes
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Resumen de Pago</CardTitle></CardHeader>
          <CardContent className="space-y-4">
             <div className="flex justify-between font-bold text-xl">
               <span>Total:</span>
               <span>RD$ 0.00</span>
             </div>
             <Button className="w-full h-12" disabled>Procesar Recibo</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}