"use client"

import { useState } from "react"
import { registerPayment } from "@/actions/payments" // Importamos la lógica que ya tienes
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send } from "lucide-react"

// Definimos los tipos de datos exactos del préstamo
interface LoanData {
    id: string;
    client: { nombre_completo: string };
    saldo_restante: number;
    cuota_mensual: number;
    estado: string;
}

interface PaymentFormProps {
    loan: LoanData;
}

export function PaymentForm({ loan }: PaymentFormProps) {
    const [message, setMessage] = useState<string | null>(null)
    const [isSuccess, setIsSuccess] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        setMessage(null)

        const result = await registerPayment(formData)
        setMessage(result.message)
        setIsSuccess(result.success)
        setIsLoading(false)

        // Aquí podrías recargar la página para ver el nuevo saldo
        if (result.success) {
            window.location.reload()
        }
    }

    // Función para formatear a pesos dominicanos (RD$)
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">
                    Préstamo de {loan.client.nombre_completo}
                </CardTitle>
                <div className="text-sm space-y-1">
                    <p><strong>Saldo Pendiente:</strong> <span className="text-xl font-bold text-red-600">{formatCurrency(loan.saldo_restante)}</span></p>
                    <p><strong>Cuota Mensual Sugerida:</strong> {formatCurrency(loan.cuota_mensual)}</p>
                    <p><strong>Estado:</strong> {loan.estado}</p>
                </div>
            </CardHeader>
            <CardContent>
                {message && (
                    <div className={`p-3 mb-4 rounded ${isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message}
                    </div>
                )}
                <form action={handleSubmit} className="space-y-4">

                    {/* Campo oculto para pasar el ID del préstamo al Server Action */}
                    <input type="hidden" name="loanId" value={loan.id} />

                    <div className="space-y-2">
                        <Label htmlFor="montoTotalPagado">Monto Total a Pagar (RD$)</Label>
                        <Input
                            id="montoTotalPagado"
                            name="montoTotalPagado"
                            type="number"
                            step="0.01"
                            placeholder={loan.cuota_mensual.toFixed(2)} // Sugiere la cuota
                            required
                            defaultValue={loan.cuota_mensual.toFixed(2)}
                            disabled={loan.estado !== "ACTIVO"}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading || loan.estado !== "ACTIVO"}>
                        <Send className="w-4 h-4 mr-2" />
                        {isLoading ? "Procesando..." : loan.estado !== "ACTIVO" ? "Préstamo Liquidado" : "Confirmar Pago"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}