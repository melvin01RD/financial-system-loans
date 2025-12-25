"use client"

import { useState } from "react"
import { createLoan } from "@/actions/loans"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, DollarSign } from "lucide-react"

interface LoanFormProps {
    clients: { id: string; nombre_completo: string }[]
}

export function LoanForm({ clients }: LoanFormProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)
        setSuccess(null)

        const result = await createLoan(formData)

        if (result.success) {
            setSuccess(result.message)
            // Opcional: limpiar formulario o redireccionar
        } else {
            setError(result.message)
        }
        setLoading(false)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-6 h-6" />
                    Nuevo Préstamo 
                </CardTitle>
            </CardHeader>
            <CardContent>
                {success && (
                    <div className="bg-green-100 text-green-800 p-3 rounded mb-4">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="clientId">Cliente *</Label>
                        <Select name="clientId" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar Cliente" />
                            </SelectTrigger>
                            <SelectContent>
                                {clients.map((client) => (
                                    <SelectItem key={client.id} value={client.id}>
                                        {client.nombre_completo}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="montoPrincipal">Monto Principal (RD$) *</Label>
                            <Input 
                                name="montoPrincipal" 
                                type="number" 
                                step="0.01" 
                                placeholder="Ej. 50000" 
                                required 
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tasaInteresAnual">Tasa Anual (%) *</Label>
                            <Input 
                                name="tasaInteresAnual" 
                                type="number" 
                                step="0.01" 
                                placeholder="Ej. 120 (para 10% mensual)" 
                                required 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="frecuencia">Frecuencia de Pago *</Label>
                            <Select name="frecuencia" defaultValue="MENSUAL">
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona frecuencia" />
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
                            <Input 
                                name="plazoMeses" 
                                type="number" 
                                placeholder="Ej. 4 (si son 4 semanas)" 
                                required 
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="garantias">Garantías (Opcional)</Label>
                        <Textarea 
                            name="garantias" 
                            placeholder="Descripción de la garantía..." 
                            className="min-h-[100px]"
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Calculando y Registrando...
                            </>
                        ) : (
                            "Registrar Préstamo"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
