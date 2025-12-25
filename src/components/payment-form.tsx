"use client"

import { useState } from "react"
import { registerPayment } from "@/actions/payments"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, CheckCircle, AlertCircle, Send } from "lucide-react"

interface PaymentFormProps {
    loan: {
        id: string
        saldo_capital: number
        cuota_fija: number
        estado: string
        client: {
            nombre_completo: string
        }
    }
}

export function PaymentForm({ loan }: PaymentFormProps) {
    const [monto, setMonto] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [type, setType] = useState<"success" | "error" | null>(null)

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        setMessage(null)
        setType(null)

        const montoVal = formData.get("montoTotalPagado")
        
        if (!montoVal || Number(montoVal) <= 0) {
            setType("error")
            setMessage("El monto a pagar debe ser mayor que 0.")
            setLoading(false)
            return
        }

        try {
            const result = await registerPayment(formData)

            if (result) {
                setType(result.success ? "success" : "error")
                setMessage(result.message)
                if (result.success) setMonto("")
            } else {
                setType("error")
                setMessage("Error desconocido al procesar el pago.")
            }
        } catch (error) {
            setType("error")
            setMessage("Ocurrió un error al intentar registrar el pago.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full bg-white shadow-sm border-slate-200">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Registrar Pago
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-6 p-4 bg-slate-50 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-500">Cliente:</span>
                        <span className="font-medium">{loan.client.nombre_completo}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Saldo Actual:</span>
                        <span className="font-medium">RD$ {loan.saldo_capital.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Cuota Sugerida:</span>
                        <span className="font-medium">RD$ {loan.cuota_fija.toLocaleString()}</span>
                    </div>
                </div>

                <form action={handleSubmit} className="space-y-4">
                    <input type="hidden" name="loanId" value={loan.id} />
                    
                    <div className="space-y-2">
                        <Label htmlFor="monto">Monto a Pagar (RD$)</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                id="monto"
                                name="montoTotalPagado"
                                type="number"
                                step="0.01"
                                className="pl-9"
                                placeholder="0.00"
                                value={monto}
                                onChange={e => setMonto(e.target.value)}
                                required
                                disabled={loan.estado !== "ACTIVO"}
                            />
                        </div>
                    </div>

                    {message && (
                        <div className={`p-3 rounded-md flex items-start gap-2 text-sm ${
                            type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                        }`}>
                            {type === "success" ? <CheckCircle className="w-4 h-4 mt-0.5" /> : <AlertCircle className="w-4 h-4 mt-0.5" />}
                            <p>{message}</p>
                        </div>
                    )}

                    <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loading || loan.estado !== "ACTIVO"}
                    >
                        {loading ? "Procesando..." : loan.estado !== "ACTIVO" ? "Préstamo Liquidado" : "Confirmar Pago"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
