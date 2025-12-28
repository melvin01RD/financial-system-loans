"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, DollarSign, CheckCircle2, AlertCircle } from "lucide-react"

interface LoanFormProps {
    clients: { id: string; nombre: string }[]
}

export function LoanForm({ clients }: LoanFormProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(null)

        const formData = new FormData(event.currentTarget)
        
        // Preparamos los datos exactamente como los pide tu API y tu Prisma
        const loanData = {
            clientId: formData.get("clientId"),
            monto_principal: formData.get("monto"),
            tasa_interes_anual: formData.get("tasa"),
            plazo_cantidad: formData.get("plazoMeses"),
            frecuencia_pago: formData.get("frecuencia") || "MENSUAL",
            garantias: formData.get("garantias"),
            // Calculamos una cuota fija estimada para enviar a la tabla
            cuota_fija: (Number(formData.get("monto")) * (1 + (Number(formData.get("tasa")) / 100))) / Number(formData.get("plazoMeses"))
        }

        try {
            const response = await fetch('/api/prestamos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loanData)
            })

            const result = await response.json()

            if (response.ok) {
                setSuccess("¡Préstamo registrado con éxito en Neon!")
                event.currentTarget.reset()
            } else {
                setError(result.error || "Error al registrar el préstamo")
            }
        } catch (err) {
            setError("Error de conexión con el servidor")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="shadow-lg border-t-4 border-t-blue-600">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    Registrar Nuevo Préstamo
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center gap-2 text-sm border border-red-200">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-50 text-green-600 p-3 rounded-md flex items-center gap-2 text-sm border border-green-200">
                            <CheckCircle2 className="w-4 h-4" /> {success}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Seleccionar Cliente *</Label>
                        <Select name="clientId" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Busca un cliente..." />
                            </SelectTrigger>
                            <SelectContent>
                                {clients.map((client) => (
                                    <SelectItem key={client.id} value={client.id}>
                                        {client.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="monto">Monto del Préstamo *</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input name="monto" type="number" step="0.01" className="pl-9" placeholder="0.00" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tasa">Tasa de Interés Anual (%) *</Label>
                            <Input name="tasa" type="number" step="0.01" placeholder="Ej. 12" required />
                        </div>

                        <div className="space-y-2">
                            <Label>Frecuencia de Pago *</Label>
                            <Select name="frecuencia" defaultValue="MENSUAL">
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
                            <Label htmlFor="plazoMeses">Cantidad de Cuotas *</Label>
                            <Input name="plazoMeses" type="number" placeholder="Ej. 12" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="garantias">Garantías (Opcional)</Label>
                        <Textarea name="garantias" placeholder="Detalles de la garantía..." className="min-h-[80px]" />
                    </div>

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                        {loading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...</>
                        ) : (
                            "Crear Préstamo en Neon"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}