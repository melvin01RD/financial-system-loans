"use client"

import { useState } from "react"
import { createLoan } from "@/actions/loans"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Zap } from "lucide-react"

interface LoanFormProps {
    clients: { id: string; nombre_completo: string }[]
}

export function LoanForm({ clients }: LoanFormProps) {
    const [message, setMessage] = useState<string | null>(null)
    const [isSuccess, setIsSuccess] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        setMessage(null)

        try {
            const result = await createLoan(formData)
            setMessage(result.message)
            setIsSuccess(result.success)
        } catch (error) {
            setMessage("Ocurrió un error inesperado.")
            setIsSuccess(false)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Datos del Crédito</CardTitle>
            </CardHeader>
            <CardContent>
                {message && (
                    <div className={`p-4 mb-4 rounded ${isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message}
                    </div>
                )}
                <form action={handleSubmit} className="space-y-6">

                    {/* 1. SELECCIÓN DE CLIENTE */}
                    <div className="space-y-2">
                        <Label htmlFor="clientId">Cliente *</Label>
                        <Select name="clientId" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona el cliente" />
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* 2. MONTO */}
                        <div className="space-y-2">
                            <Label htmlFor="montoPrincipal">Monto Principal (RD$) *</Label>
                            <Input id="montoPrincipal" name="montoPrincipal" type="number" step="1000" placeholder="Ej. 50000" required />
                        </div>

                        {/* 3. TASA ANUAL */}
                        <div className="space-y-2">
                            <Label htmlFor="tasaInteresAnual">Tasa Anual (%) *</Label>
                            <Input id="tasaInteresAnual" name="tasaInteresAnual" type="number" step="0.01" placeholder="Ej. 15.00" required />
                        </div>

                        {/* 4. PLAZO */}
                        <div className="space-y-2">
                            <Label htmlFor="plazoMeses">Plazo (Meses) *</Label>
                            <Input id="plazoMeses" name="plazoMeses" type="number" step="1" placeholder="Ej. 12" required />
                        </div>
                    </div>

                    {/* 5. GARANTÍAS */}
                    <div className="space-y-2">
                        <Label htmlFor="garantias">Garantías (Opcional)</Label>
                        <Textarea id="garantias" name="garantias" placeholder="Descripción de la garantía, ej: Acta de vehículo, título de propiedad." />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        <Zap className="w-4 h-4 mr-2" />
                        {isLoading ? "Procesando..." : "Calcular y Registrar Préstamo"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
