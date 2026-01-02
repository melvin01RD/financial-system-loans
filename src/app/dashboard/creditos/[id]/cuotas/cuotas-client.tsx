'use client';

import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, DollarSign } from "lucide-react";

export default function CuotasClient({ credito }: { credito: any }) {
  const router = useRouter();

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Estado de Préstamo - ${credito?.client?.nombre}`, 14, 15);

    const tableData = credito.amortizationSchedule.map((c: any) => [
      c.numero_cuota,
      new Date(c.fecha_vencimiento).toLocaleDateString(),
      `RD$ ${Number(c.monto_cuota).toLocaleString()}`,
      c.estado
    ]);

    autoTable(doc, {
      head: [['#', 'Vencimiento', 'Monto', 'Estado']],
      body: tableData,
      startY: 25,
    });
    doc.save(`Prestamo_${credito.id}.pdf`);
  };

  const totalInteres = credito.monto_principal * (credito.tasa_interes_anual / 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">Detalle de Cuotas</h1>
        <Button onClick={exportPDF} variant="outline" className="ml-auto">
          <Download className="mr-2 h-4 w-4" /> Exportar PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-blue-600">Capital Prestado</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-900">RD$ {Number(credito.monto_principal).toLocaleString()}</div></CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-green-600">Total Intereses (Est.)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-900">RD$ {Number(totalInteres).toLocaleString()}</div></CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-orange-600">Estado del Crédito</CardTitle></CardHeader>
          <CardContent><Badge className="text-lg">{credito.estado}</Badge></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Tabla de Amortización</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Cuota #</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead className="text-right">Monto Cuota</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {credito.amortizationSchedule.map((cuota: any) => (
                <TableRow key={cuota.id}>
                  <TableCell className="font-medium">{cuota.numero_cuota}</TableCell>
                  <TableCell>{new Date(cuota.fecha_vencimiento).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right font-bold">RD$ {Number(cuota.monto_cuota).toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={cuota.estado === 'PAGADO' ? 'default' : 'destructive'}>
                      {cuota.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {cuota.estado !== 'PAGADO' && (
                      <Button size="sm" onClick={() => router.push(`/dashboard/pagos/${cuota.id}`)}>
                        <DollarSign className="mr-2 h-4 w-4" /> Cobrar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}