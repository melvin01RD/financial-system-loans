"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateLoan } from "@/actions/loans"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Loader2 } from "lucide-react"

interface EditarClientProps {
  loan: any
}

export function EditarClient({ loan }: EditarClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setMessage(null)
    
    // Append estado manually if needed or ensure select works with formData
    // Shadcn Select doesn't always play nice with FormData automatically if not inside a form with name
    // But we can use hidden input or just append it.
    // Actually, we can just pass the formData directly if the inputs have names.
    
    const result = await updateLoan(loan.id, formData)
    
    if (result.success) {
      setMessage({ type: 'success', text: result.message })
      router.refresh()
    } else {
      setMessage({ type: 'error', text: result.message })
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Editar Crédito</h2>
          <p className="text-sm text-gray-500">Modificar condiciones del préstamo</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Préstamo</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            {message && (
              <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Input value={`${loan.client.nombre} ${loan.client.apellido || ''}`} disabled className="bg-gray-100" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monto">Monto Principal (RD$)</Label>
                <Input 
                  id="monto" 
                  name="monto" 
                  type="number" 
                  defaultValue={Number(loan.monto_principal)} 
                  step="0.01" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plazoMeses">Plazo (Cuotas)</Label>
                <Input 
                  id="plazoMeses" 
                  name="plazoMeses" 
                  type="number" 
                  defaultValue={loan.plazo_cantidad} 
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaInicio">Fecha de Desembolso</Label>
                <Input 
                  id="fechaInicio" 
                  name="fechaInicio" 
                  type="date" 
                  defaultValue={new Date(loan.fecha_desembolso).toISOString().split('T')[0]} 
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select name="estado" defaultValue={loan.estado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVO">Activo</SelectItem>
                    <SelectItem value="VENCIDO">Vencido</SelectItem>
                    <SelectItem value="LIQUIDADO">Liquidado</SelectItem>
                    <SelectItem value="CANCELADO">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Guardar Cambios
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
