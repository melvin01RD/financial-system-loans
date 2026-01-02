'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Receipt, DollarSign, Calendar } from "lucide-react";

export default function ProcesarPagoPage() {
  const params = useParams();
  const router = useRouter();
  const [cuota, setCuota] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [montoRecibido, setMontoRecibido] = useState('');
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const res = await fetch(`/api/cuotas/${params.cuotaId}`);
        if (!res.ok) throw new Error("Fallo al cargar");
        const data = await res.json();
        setCuota(data);
        // Default to the quota amount
        setMontoRecibido(data.monto_cuota ? data.monto_cuota.toString() : '');
      } catch (err) {
        console.error("Error al cargar cuota", err);
      } finally {
        setLoading(false);
      }
    };
    if (params.cuotaId) cargarDatos();
  }, [params.cuotaId]);

  const handlePago = async () => {
    setProcesando(true);
    try {
      const res = await fetch('/api/pagos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cuotaId: params.cuotaId,
          monto: parseFloat(montoRecibido),
          tipo_pago: 'CUOTA_REGULAR'
        })
      });

      if (res.ok) {
        alert("¡Pago registrado exitosamente!");
        // Redirect to loan amortization schedule
        if (cuota?.loanId) {
          router.push(`/dashboard/creditos/${cuota.loanId}/cuotas`);
        } else {
          router.push('/dashboard/creditos');
        }
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message || 'No se pudo procesar el pago'}`);
      }
    } catch (err) {
      alert("Error de conexión al procesar el pago");
    } finally {
      setProcesando(false);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-green-600 h-8 w-8" /></div>;
  if (!cuota) return <div className="p-10 text-center text-red-500">Error: No se encontró la información de la cuota.</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="border-t-4 border-green-600 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Receipt className="text-green-600" /> Registrar Recibo de Pago
          </CardTitle>
          <p className="text-slate-500">
            Cuota #{cuota.numero_cuota} - {cuota.loan?.client?.nombre} {cuota.loan?.client?.apellido}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
            <div>
              <Label className="text-xs uppercase text-slate-500">Monto Cuota</Label>
              <p className="text-xl font-bold">RD$ {Number(cuota.monto_cuota).toLocaleString()}</p>
            </div>
            <div>
              <Label className="text-xs uppercase text-slate-500">Vencimiento</Label>
              <p className="text-xl font-bold flex items-center gap-2">
                <Calendar size={18} /> {new Date(cuota.fecha_vencimiento).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label className="text-lg font-bold">Monto a Recibir</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 text-slate-400" />
                <Input 
                  type="number" 
                  className="pl-10 h-14 text-2xl font-black text-green-700 focus:ring-green-500 border-2" 
                  value={montoRecibido}
                  onChange={(e) => setMontoRecibido(e.target.value)}
                />
              </div>
              <p className="text-sm text-slate-500 italic">Pago Regular de Cuota</p>
            </div>
            <Button 
              className="w-full h-16 bg-green-600 hover:bg-green-700 text-xl font-bold shadow-lg"
              onClick={handlePago}
              disabled={procesando || !montoRecibido}
            >
              {procesando ? <Loader2 className="animate-spin mr-2" /> : <DollarSign className="mr-2" />} 
              Confirmar y Generar Recibo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
