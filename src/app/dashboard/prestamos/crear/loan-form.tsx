"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, DollarSign, AlertTriangle, CalendarDays } from "lucide-react"

interface LoanFormProps {
    clients: { id: string; nombre: string }[]
    evaluacionPrevia?: any;
}

export function LoanForm({ clients, evaluacionPrevia }: LoanFormProps) {
    const [loading, setLoading] = useState(false)
    const [monto, setMonto] = useState(0)
    const [tasa, setTasa] = useState(0)
    const [cuotas, setCuotas] = useState(0)
    const [frecuencia, setFrecuencia] = useState("MENSUAL")


// LÓGICA FINANCIERA CORREGIDA Y REDONDEADA
    const infoCalculada = useMemo(() => {
        if (!monto || !tasa || !cuotas || cuotas <= 0) return { cuota: 0, totalInteres: 0 };
        
        // 1. Tasa por periodo
        let i = (tasa / 100);
        if (frecuencia === "MENSUAL") i /= 12;
        if (frecuencia === "QUINCENAL") i /= 24;
        if (frecuencia === "SEMANAL") i /= 52;

        // 2. Método Francés (Cuota Fija)
        let cuota = 0;
        if (i === 0) {
            cuota = monto / cuotas;
        } else {
            // Fórmula: R = P * [ i / (1 - (1+i)^-n) ]
            cuota = (monto * i) / (1 - Math.pow(1 + i, -cuotas));
        }

        const totalPagar = cuota * cuotas;
        const totalInteres = totalPagar - monto;
        
        // RETORNAMOS VALORES REDONDEADOS PARA EVITAR CONFUSIÓN
        return {
            cuota: Math.round(cuota), // Redondeo a peso dominicano exacto
            totalInteres: Math.round(totalInteres)
        };
    }, [monto, tasa, cuotas, frecuencia]);

    const superaCapacidad = evaluacionPrevia && infoCalculada.cuota > evaluacionPrevia.cuotaMaxima;

    return (
        <Card className="border-t-4 border-t-blue-600 shadow-xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="text-blue-600" />
                    Generar Préstamo
                </CardTitle>
                {evaluacionPrevia && (
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 mt-2">
                        <p className="text-sm text-amber-800 font-medium">
                            🚨 Capacidad de pago del cliente: 
                            <span className="font-bold"> RD$ {evaluacionPrevia.cuotaMaxima.toLocaleString()}</span>
                        </p>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Selector de Cliente (Bloqueado si viene de evaluación) */}
                        <div className="space-y-2">
                            <Label>Cliente</Label>
                            <Select defaultValue={evaluacionPrevia?.clienteId}>
                                <SelectTrigger className={evaluacionPrevia ? "bg-gray-100" : ""}>
                                    <SelectValue placeholder="Seleccione un cliente" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Frecuencia de Pago */}
                        <div className="space-y-2">
                            <Label>Frecuencia de Pago</Label>
                            <Select onValueChange={setFrecuencia} defaultValue="MENSUAL">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SEMANAL">Semanal</SelectItem>
                                    <SelectItem value="QUINCENAL">Quincenal</SelectItem>
                                    <SelectItem value="MENSUAL">Mensual</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Monto (RD$)</Label>
                            <Input type="number" onChange={(e) => setMonto(Number(e.target.value))} placeholder="0.00" />
                        </div>

                        <div className="space-y-2">
                            <Label>Tasa Anual (%)</Label>
                            <Input type="number" onChange={(e) => setTasa(Number(e.target.value))} placeholder="Ej. 18" />
                        </div>

                        <div className="space-y-2">
                            <Label>Cantidad de Cuotas</Label>
                            <Input type="number" onChange={(e) => setCuotas(Number(e.target.value))} placeholder="12, 24..." />
                        </div>
                    </div>

                    {/* RESUMEN FINANCIERO */}
                    <div className={`p-5 rounded-2xl border-2 transition-all ${superaCapacidad ? 'bg-red-50 border-red-200' : 'bg-slate-900 border-slate-800 text-white'}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className={`text-xs uppercase font-bold ${superaCapacidad ? 'text-red-400' : 'text-slate-400'}`}>Cuota {frecuencia.toLowerCase()}</p>
                                <p className={`text-3xl font-black ${superaCapacidad ? 'text-red-600' : 'text-blue-400'}`}>
                                    RD$ {infoCalculada.cuota.toLocaleString(('en-US'), {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs uppercase font-bold text-slate-400">Total Intereses</p>
                                <p className="text-xl font-bold">RD$ {infoCalculada.totalInteres.toLocaleString(('en-US'), {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                            </div>
                        </div>
                        
                        {superaCapacidad && (
                            <div className="mt-4 flex items-center gap-2 text-red-700 bg-red-100 p-2 rounded-lg text-sm font-bold">
                                <AlertTriangle size={18} />
                                ¡ALERTA! La cuota supera la capacidad del cliente.
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Garantía y Notas</Label>
                        <Textarea 
                            defaultValue={evaluacionPrevia?.garantia}
                            placeholder="Describa la garantía prendaria o notas..." 
                        />
                    </div>

                    <Button type="submit" className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700">
                        {loading ? <Loader2 className="animate-spin" /> : "Confirmar y Desembolsar"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}