import { prisma } from "@/lib/prisma";
import CuotasClient from './cuotas-client';
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function CuotasPage({ params }: { params: { id: string } }) {
  const loan = await prisma.loan.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      amortizationSchedule: {
        orderBy: { numero_cuota: 'asc' }
      }
    }
  });

  if (!loan) {
    return notFound();
  }

  // Serializamos los datos para pasarlos al cliente (especialmente fechas y decimales)
  // Prisma Decimal objects need to be converted to strings or numbers for client components if not careful, 
  // but Next SC usually handles basic JSON serialization. However, Decimal types often cause issues.
  // I will transform them to numbers or strings to be safe.
  const serializedLoan = {
    ...loan,
    monto_principal: Number(loan.monto_principal),
    tasa_interes_anual: Number(loan.tasa_interes_anual),
    cuota_fija: Number(loan.cuota_fija),
    saldo_capital: Number(loan.saldo_capital),
    amortizationSchedule: loan.amortizationSchedule.map(s => ({
      ...s,
      monto_cuota: Number(s.monto_cuota),
      capital_cuota: Number(s.capital_cuota),
      interes_cuota: Number(s.interes_cuota),
      saldo_pendiente: Number(s.saldo_pendiente),
    }))
  };

  return (
    <div className="p-6">
      <CuotasClient credito={serializedLoan} />
    </div>
  );
}