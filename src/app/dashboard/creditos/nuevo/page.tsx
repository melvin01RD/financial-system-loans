'use client';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, AlertCircle, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { calculateAmortization, PaymentFrequency } from "@/lib/finance-utils";

export default function NuevoCreditoPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    clientId: '',
    monto: '',
    tasa: '20', // Default flat rate
    cuotas: '12',
    frecuencia: 'MENSUAL' as PaymentFrequency,
    garantia: ''
  });

  // Cargar clientes al iniciar
  useEffect(() => {
    fetch('/api/clientes')
      .then(res => res.json())
      .then(data => setClientes(data))
      .catch(err => console.error("Error cargando clientes", err));
  }, []);

  // Cálculo en Tiempo Real (Fuente de Verdad: finance-utils)
  const preview = useMemo(() => {
    const monto = parseFloat(formData.monto);
    const tasa = parseFloat(formData.tasa);
    const cuotas = parseInt(formData.cuotas);

    if (!monto || !tasa || !cuotas) return null;

    return calculateAmortization(monto, tasa, cuotas, formData.frecuencia);
  }, [formData.monto, formData.tasa, formData.cuotas, formData.frecuencia]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/prestamos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: formData.clientId,
          monto: parseFloat(formData.monto),
          tasa: parseFloat(formData.tasa),
          cuotas: parseInt(formData.cuotas),
          frecuencia: formData.frecuencia,
          garantia: formData.garantia
        }),
      });

      if (res.ok) {
        setSuccess(true);
        // Limpieza automática
        setFormData({ ...formData, monto: '', garantia: '' });
        // Redirigir suavemente tras 4 segundos
        setTimeout(() => router.push('/dashboard/creditos'), 4000);
      } else {
        const data = await res.json();
        setError(data.error || 'Error al crear el préstamo');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Button variant="ghost" onClick={() => router.push('/dashboard/creditos')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMNA 1: FORMULARIO */}
        <div className="lg:col-span-2">
            <Card className="shadow-lg border-t-4 border-blue-600">
                <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Calculator className="text-blue-600" /> Crear Nuevo Préstamo
                </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {success && (
                        <div className="p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-3 animate-pulse">
                            <CheckCircle2 size={24} />
                            <div>
                                <p className="font-bold">¡Préstamo Creado!</p>
                                <p className="text-sm">Redirigiendo al listado...</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-100 text-red-700 rounded flex items-center gap-2">
                            <AlertCircle size={18}/>{error}
                        </div>
                    )}
                    
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Cliente</Label>
                            <Select onValueChange={(v) => setFormData({...formData, clientId: v})}>
                            <SelectTrigger><SelectValue placeholder="Seleccione un cliente..." /></SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                {clientes.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.nombre} {c.apellido}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Monto (RD$)</Label>
                                <Input type="number" required value={formData.monto} onChange={(e) => setFormData({...formData, monto: e.target.value})} placeholder="Ej. 10000" />
                            </div>
                            <div className="space-y-2">
                                <Label>Tasa Interés Total (%)</Label>
                                <Input type="number" value={formData.tasa} onChange={(e) => setFormData({...formData, tasa: e.target.value})} />
                                <p className="text-[10px] text-gray-400">Tasa simple aplicada al total</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Cuotas</Label>
                                <Input type="number" value={formData.cuotas} onChange={(e) => setFormData({...formData, cuotas: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Frecuencia</Label>
                                <Select value={formData.frecuencia} onValueChange={(v: any) => setFormData({...formData, frecuencia: v})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SEMANAL">Semanal</SelectItem>
                                        <SelectItem value="QUINCENAL">Quincenal</SelectItem>
                                        <SelectItem value="MENSUAL">Mensual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Garantía / Observaciones</Label>
                            <Input value={formData.garantia} onChange={(e) => setFormData({...formData, garantia: e.target.value})} placeholder="Detalle de garantía..." />
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg font-bold" disabled={loading || !formData.clientId}>
                    {loading ? <Loader2 className="animate-spin" /> : 'Confirmar y Desembolsar'}
                    </Button>
                </form>
                </CardContent>
            </Card>
        </div>

        {/* COLUMNA 2: PREVISUALIZACIÓN */}
        <div className="lg:col-span-1">
            <Card className="bg-slate-900 text-white h-full sticky top-6 shadow-xl border-slate-700">
                <CardHeader>
                    <CardTitle className="text-slate-300 text-sm uppercase tracking-wider">Resumen de Cálculo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {preview ? (
                        <>
                            <div>
                                <p className="text-slate-400 text-xs text-right">CUOTA {formData.frecuencia}</p>
                                <p className="text-4xl font-black text-green-400 text-right">
                                    RD$ {preview.quotaAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </p>
                            </div>

                            <div className="space-y-2 pt-4 border-t border-slate-700">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Capital:</span>
                                    <span>RD$ {parseFloat(formData.monto || '0').toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Interés Total:</span>
                                    <span className="text-yellow-400 font-bold">+ RD$ {preview.totalInterest.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-800">
                                    <span>Total a Pagar:</span>
                                    <span>RD$ {preview.totalPayable.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="bg-slate-800 p-3 rounded text-xs text-slate-400 mt-4">
                                <p>ℹ️ Cálculo basado en <strong>Interés Simple (Flat)</strong>. El interés se calcula sobre el monto inicial y se divide equitativamente.</p>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-10 text-slate-500">
                            Ingrese montos para calcular...
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}