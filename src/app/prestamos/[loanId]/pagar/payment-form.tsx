"use client"

import { useState, FormEvent } from "react"
import { registerPayment } from "@/actions/payments"

interface PaymentFormProps {
    loanId: string
}

export default function PaymentForm({ loanId }: PaymentFormProps) {
    const [monto, setMonto] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [type, setType] = useState<"success" | "error" | null>(null)

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        const formData = new FormData()
        formData.append("loanId", loanId)
        formData.append("montoTotalPagado", monto)

        const result = await registerPayment(formData)

        setLoading(false)
        setType(result.success ? "success" : "error")
        setMessage(result.message)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-sm">
            <div>
                <label className="block text-sm font-medium mb-1">
                    Monto a pagar (RD$) *
                </label>
                <input
                    type="number"
                    step="0.01"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={monto}
                    onChange={e => setMonto(e.target.value)}
                    required
                />
            </div>

            {message && (
                <p
                    className={
                        "text-sm " +
                        (type === "success" ? "text-green-600" : "text-red-600")
                    }
                >
                    {message}
                </p>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-60"
            >
                {loading ? "Procesando..." : "Registrar Pago"}
            </button>
        </form>
    )
}
