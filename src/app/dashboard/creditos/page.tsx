import { prisma } from "@/lib/prisma";
import LoansTable from './loans-table';

export const dynamic = 'force-dynamic';

export default async function ListaCreditosPage() {
  const loans = await prisma.loan.findMany({
    include: { client: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Cartera de Préstamos</h1>
      </div>
      <LoansTable initialLoans={loans} />
    </div>
  );
}
