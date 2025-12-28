'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/currency';

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clientes, setClientes] = useState<any[]>([]);
  const [creditos, setCreditos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'clientes' | 'creditos' | 'pagos' | 'cuotas' | 'perfil'>('overview');
  const [user, setUser] = useState<any>(null);

  // Filtros de cuotas
  const [clienteFilter, setClienteFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [vistaGrafico, setVistaGrafico] = useState<'dia' | 'mes' | 'año'>('mes');
  const [mostrarGrafico, setMostrarGrafico] = useState(false);

  // Helper fijo para RD$ (Dominicanos)
  const formatMoney = (amount: number, decimals = 2) => formatCurrency(amount || 0, 'DOP', { decimals });

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'clientes', 'creditos', 'pagos', 'cuotas', 'perfil'].includes(tab)) {
      setActiveTab(tab as any);
    }
  }, [searchParams]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      // Solo cargamos Clientes y Créditos (Rutas existentes en tu Backend)
      const [clientesRes, creditosRes] = await Promise.all([
        fetch('/api/clientes', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/creditos', { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);

      if (clientesRes.ok) setClientes(await clientesRes.json());
      if (creditosRes.ok) setCreditos(await creditosRes.json());
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCliente = async (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar al cliente "${nombre}"?`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/clientes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) setClientes(clientes.filter(c => c.id !== id));
    } catch (err) {
      alert('Error al eliminar cliente');
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-xl font-semibold text-gray-600">Cargando sistema...</div>
    </div>
  );

  // Cálculos de totales basados en tu Schema (Loan)
  const totalPrincipal = creditos.reduce((sum, c) => sum + Number(c.monto_principal || 0), 0);
  const totalPendiente = creditos.reduce((sum, c) => sum + Number(c.saldo_restante || 0), 0);
  const montoRecuperado = totalPrincipal - totalPendiente;

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {activeTab === 'overview' && 'Panel Principal'}
              {activeTab === 'clientes' && 'Mis Clientes'}
              {activeTab === 'creditos' && 'Cartera de Préstamos'}
              {activeTab === 'pagos' && 'Recibos de Pago'}
              {activeTab === 'cuotas' && 'Calendario de Cuotas'}
              {activeTab === 'perfil' && 'Mi Perfil'}
            </h2>
            <p className="text-sm text-gray-500">Bienvenido, {user?.name || 'Usuario'}</p>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
            <span className="text-sm font-bold text-blue-700">RD$ Pesos</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <p className="text-sm font-medium text-gray-500">Clientes Totales</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{clientes.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <p className="text-sm font-medium text-gray-500">Capital Prestado</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{formatMoney(totalPrincipal)}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <p className="text-sm font-medium text-gray-500">Capital Recuperado</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{formatMoney(montoRecuperado)}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Acciones del Día</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button onClick={() => router.push('/dashboard/clientes/nuevo')} className="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-center transition-all">
                  <i className="fa-solid fa-user-plus text-blue-600 text-2xl mb-2 block"></i>
                  <span className="text-sm font-medium">Nuevo Cliente</span>
                </button>
                <button onClick={() => router.push('/dashboard/creditos/nuevo')} className="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 text-center transition-all">
                  <i className="fa-solid fa-hand-holding-dollar text-green-600 text-2xl mb-2 block"></i>
                  <span className="text-sm font-medium">Nuevo Préstamo</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'clientes' && (
          <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre Completo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cédula</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clientes.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{c.nombre_completo}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{c.cedula}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{c.telefono}</td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => router.push(`/dashboard/clientes/${c.id}/editar`)} className="text-blue-600 hover:underline">Editar</button>
                      <button onClick={() => handleDeleteCliente(c.id, c.nombre_completo)} className="text-red-600 hover:underline">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'creditos' && (
          <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Principal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saldo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {creditos.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{loan.client?.nombre_completo}</td>
                    <td className="px-6 py-4 text-sm font-bold">{formatMoney(Number(loan.monto_principal))}</td>
                    <td className="px-6 py-4 text-sm text-red-600">{formatMoney(Number(loan.saldo_restante))}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${loan.estado === 'ACTIVO' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                        {loan.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => router.push(`/dashboard/creditos/${loan.id}`)} className="text-blue-600 font-medium">Ver Todo</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}