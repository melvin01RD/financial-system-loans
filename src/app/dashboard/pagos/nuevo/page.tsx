'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, DollarSign, User, FileText, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";

export default function RegistrarPagoPage() {
  const router = useRouter();
  
  // Estados de Datos
  const [clientes, setClientes] = useState<any[]>([]);
  const [prestamos, setPrestamos] = useState<any[]>([]);
  
  // Estados de Selección
  const [selectedClienteId, setSelectedClienteId] = useState('');
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [monto, setMonto] = useState('');
  
  // Estados de UI
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // 1. Cargar Clientes al inicio
  useEffect(() => {
    fetch('/api/clientes')
      .then(res => res.json())
      .then(data => setClientes(data))
      .catch(err => console.error(err));
  }, []);

  // 2. Cargar Préstamos cuando cambia el cliente
  useEffect(() => {
    if (!selectedClienteId) {
        setPrestamos([]);
        return;
    }
    setLoadingLoans(true);
    fetch(`/api/prestamos?clientId=${selectedClienteId}&estado=ACTIVO`)
      .then(res => res.json())
      .then(data => setPrestamos(data))
      .catch(err => console.error(err))
      .finally(() => setLoadingLoans(false));
  }, [selectedClienteId]);

  const selectedLoan = prestamos.find(p => p.id === selectedLoanId);
  
  // Calcular sugerencia de pago (Cuota o Saldo Total)
  const sugerenciaPago = selectedLoan 
    ? (selectedLoan.amortizationSchedule?.[0]?.monto_cuota || selectedLoan.saldo_capital) 
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/cobros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            loanId: selectedLoanId,
            monto: parseFloat(monto),
            tipoPago: 'CUOTA_REGULAR'
        })
      });

      if (res.ok) {
        setSuccess(true);
        setMonto('');
        setSelectedLoanId(''); 
        // Refrescar préstamos para ver nuevo saldo
        fetch(`/api/prestamos?clientId=${selectedClienteId}&estado=ACTIVO`)
            .then(r => r.json())
            .then(d => setPrestamos(d));
            
        setTimeout(() => setSuccess(false), 4000);
      } else {
        const data = await res.json();
        setError(data.error || 'Error al registrar el cobro');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <Card className="md:col-span-1 shadow-lg border-t-4 border-green-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-green-700">
              <DollarSign className="w-6 h-6" /> Registrar Nuevo Cobro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {success && (
                <div className="p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-3 animate-pulse">
                    <CheckCircle2 size={24} />
                    <div>
                        <p className="font-bold">¡Pago Registrado!</p>
                        <p className="text-sm">El saldo ha sido actualizado.</p>
                    </div>
                </div>
            )}
            
            {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded flex items-center gap-2">
                    <AlertCircle size={18}/>{error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* 1. SELECCIÓN DE CLIENTE */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><User size={16}/> Cliente</Label>
                    <Select onValueChange={setSelectedClienteId} value={selectedClienteId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Buscar cliente..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                            {clientes.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.nombre} {c.apellido}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* 2. SELECCIÓN DE PRÉSTAMO */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><FileText size={16}/> Préstamo Activo</Label>
                    <Select onValueChange={setSelectedLoanId} value={selectedLoanId} disabled={!selectedClienteId || loadingLoans}>
                        <SelectTrigger>
                            <SelectValue placeholder={loadingLoans ? "Cargando..." : "Seleccione préstamo..."} />
                        </SelectTrigger>
                        <SelectContent>
                            {prestamos.map(p => (
                                <SelectItem key={p.id} value={p.id}>
                                    RD$ {parseFloat(p.monto_principal).toLocaleString()} - Saldo: {parseFloat(p.saldo_capital).toLocaleString()}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {selectedClienteId && prestamos.length === 0 && !loadingLoans && (
                        <p className="text-xs text-amber-600">Este cliente no tiene préstamos activos.</p>
                    )}
                </div>

                {/* 3. MONTO A PAGAR */}
                <div className="space-y-2">
                    <Label>Monto a Pagar (RD$)</Label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <Input 
                            type="number" 
                            className="pl-10 text-lg font-bold text-green-700" 
                            placeholder="0.00" 
                            value={monto}
                            onChange={(e) => setMonto(e.target.value)}
                            disabled={!selectedLoanId}
                        />
                    </div>
                    {selectedLoan && (
                        <p className="text-xs text-gray-500 text-right cursor-pointer hover:text-blue-600" 
                           onClick={() => setMonto(sugerenciaPago.toString())}>
                            Sugerido: RD$ {parseFloat(sugerenciaPago).toLocaleString()}
                        </p>
                    )}
                </div>

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg" 
                        disabled={submitting || !selectedLoanId || !monto}>
                    {submitting ? <Loader2 className="animate-spin" /> : 'Confirmar Pago'}
                </Button>
            </form>
          </CardContent>
        </Card>

        {/* COLUMNA DERECHA: DETALLES DEL PRÉSTAMO */}
        <div className="md:col-span-1">
            {selectedLoan ? (
                <Card className="bg-slate-50 border-slate-200 shadow-inner h-full">
                    <CardHeader>
                        <CardTitle className="text-slate-700">Detalles del Préstamo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Capital Original</p>
                                <p className="font-semibold text-lg">RD$ {parseFloat(selectedLoan.monto_principal).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Fecha Inicio</p>
                                <p className="font-semibold text-lg">{new Date(selectedLoan.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-white rounded-lg border border-slate-200">
                            <p className="text-xs text-slate-500 uppercase mb-1">Saldo Pendiente Actual</p>
                            <p className="text-3xl font-black text-red-500">
                                RD$ {(parseFloat(selectedLoan.saldo_capital) + parseFloat(selectedLoan.saldo_interes)).toLocaleString()}
                            </p>
                            <div className="flex justify-between text-xs text-slate-400 mt-2">
                                <span>Cap: {parseFloat(selectedLoan.saldo_capital).toLocaleString()}</span>
                                <span>Int: {parseFloat(selectedLoan.saldo_interes).toLocaleString()}</span>
                            </div>
                        </div>

                        {selectedLoan.amortizationSchedule?.[0] && (
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <p className="text-xs text-blue-600 uppercase font-bold mb-1">Próxima Cuota (#{selectedLoan.amortizationSchedule[0].numero_cuota})</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-blue-900">
                                        RD$ {parseFloat(selectedLoan.amortizationSchedule[0].monto_cuota).toLocaleString()}
                                    </span>
                                    <span className="text-xs bg-white px-2 py-1 rounded text-blue-500 border border-blue-200">
                                        Vence: {new Date(selectedLoan.amortizationSchedule[0].fecha_vencimiento).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 text-gray-400 p-10 text-center">
                    <p>Seleccione un préstamo para ver sus detalles</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
