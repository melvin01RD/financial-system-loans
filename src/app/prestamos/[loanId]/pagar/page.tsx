import PaymentForm from "./payment-form"

interface PagarPrestamoPageProps {
    params: {
        loanId: string
    }
}

export default function PagarPrestamoPage({ params }: PagarPrestamoPageProps) {
    const { loanId } = params

    return (
        <main className="min-h-screen bg-slate-50">
            <section className="max-w-4xl mx-auto py-10">
                <h1 className="text-3xl font-bold mb-6">
                    Pagar Préstamo
                </h1>

                <PaymentForm loanId={loanId} />
            </section>
        </main>
    )
}