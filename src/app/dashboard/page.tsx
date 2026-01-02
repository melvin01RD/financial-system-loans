import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, AlertCircle, Calendar } from "lucide-react";
import { RecentClients } from "./components/RecentClients";

// Forzamos que no haya caché para que los números de Neon sean en tiempo real
export const revalidate = 0;

export default async function DashboardPage() {
  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 7);

  // Consultas usando tus nombres exactos: AmortizationSchedule, Loan, Client
  const [totalClientes, cartera, mora, proximos] = await Promise.all([
    // 1. Contador de Clientes
    prisma.client.count(),
    
    // 2. Cartera: Suma de monto_principal de préstamos ACTIVOS
    prisma.loan.aggregate({
      _sum: { monto_principal: true },
      where: { estado: 'ACTIVO' }
    }),

    // 3. Mora: Cuotas PENDIENTES o VENCIDAS cuya fecha ya pasó
    prisma.amortizationSchedule.aggregate({
      _sum: { monto_cuota: true },
      where: {
        estado: { in: ['PENDIENTE', 'VENCIDO'] },
        fecha_vencimiento: { lt: now }
      }
    }),

    // 4. Cobros de la Semana: Cuotas PENDIENTES que vencen en los próximos 7 días
    prisma.amortizationSchedule.aggregate({
      _sum: { monto_cuota: true },
      where: {
        estado: 'PENDIENTE',
        fecha_vencimiento: {
          gte: now,
          lte: nextWeek
        }
      }
    })
  ]);

  const stats = [
    {
      title: "Total Clientes",
      value: totalClientes.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      border: "border-l-blue-600",
      description: "Clientes registrados"
    },
    {
      title: "Cartera en Calle",
      value: `RD$ ${Number(cartera._sum.monto_principal || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
      icon: Briefcase,
      color: "text-indigo-600",
      border: "border-l-indigo-600",
      description: "Capital activo"
    },
    {
      title: "Mora Acumulada",
      value: `RD$ ${Number(mora._sum.monto_cuota || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
      icon: AlertCircle,
      color: "text-red-600",
      border: "border-l-red-600",
      description: "Cuotas atrasadas"
    },
    {
      title: "Cobros de la Semana",
      value: `RD$ ${Number(proximos._sum.monto_cuota || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
      icon: Calendar,
      color: "text-green-600",
      border: "border-l-green-600",
      description: "Próximos 7 días"
    }
  ];

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
        <p className="text-muted-foreground tracking-wide">
          Resumen financiero de <strong>YaPresto</strong>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className={`border-l-4 ${stat.border} shadow-sm hover:shadow-md transition-shadow`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <RecentClients />
        <Card className="col-span-3 h-full flex flex-col items-center justify-center border-dashed border-2 text-muted-foreground bg-slate-50/50">
            <span className="font-semibold text-lg">Actividad Reciente</span>
            <p className="text-sm italic">Conectando historial...</p>
        </Card>
      </div>
    </div>
  );
}