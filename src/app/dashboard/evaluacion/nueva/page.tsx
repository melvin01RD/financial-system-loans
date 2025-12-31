'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NuevaEvaluacionPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clienteId: '',
    ingresosMensuales: 0,
    gastosMensuales: 0,
    porcentajeEndeudamiento: 40, 
    fuenteIngresos: '', 
    garantia: '',       
   observaciones: ''  
  });

  // Cálculos automáticos
  const ingresoDisponible = formData.ingresosMensuales - formData.gastosMensuales;
  const cuotaMaxima = ingresoDisponible > 0 ? ingresoDisponible * (formData.porcentajeEndeudamiento / 100) : 0;

  useEffect(() => {
    // Cargar la lista de clientes para el selector
    const fetchClientes = async () => {
      const res = await fetch('/api/clientes');
      const data = await res.json();
      setClientes(data);
    };
    fetchClientes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/evaluaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) router.push('/dashboard/');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Nueva Evaluación de Crédito</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Formulario de Entrada */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700">Seleccionar Cliente</label>
            <select 
              required
              className="w-full p-3 border rounded-lg mt-1"
              value={formData.clienteId}
              onChange={(e) => setFormData({...formData, clienteId: e.target.value})}
            >
              <option value="">-- Seleccione un cliente --</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre} {c.apellido} - {c.cedula}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700">Ingresos Totales (RD$)</label>
            <input 
              type="number" 
              className="w-full p-3 border rounded-lg mt-1"
              onChange={(e) => setFormData({...formData, ingresosMensuales: Number(e.target.value)})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700">Gastos Totales (RD$)</label>
            <input 
              type="number" 
              className="w-full p-3 border rounded-lg mt-1"
              onChange={(e) => setFormData({...formData, gastosMensuales: Number(e.target.value)})}
            />
          </div>

         
<div className="space-y-4 pt-4 border-t">
  <div>
    <label className="block text-sm font-bold text-gray-700">Fuente de Ingresos</label>
    <input 
      type="text" 
      placeholder="Ej: Empleado público / Dueño de colmado"
      className="w-full p-3 border rounded-lg mt-1"
      onChange={(e) => setFormData({...formData, fuenteIngresos: e.target.value})}
    />
  </div>
  <div>
    <label className="block text-sm font-bold text-gray-700">Garantía Ofrecida</label>
    <textarea 
      placeholder="Ej: Motor CG-200 / Título de propiedad"
      className="w-full p-3 border rounded-lg mt-1"
      onChange={(e) => setFormData({...formData, garantia: e.target.value})}
    />
  </div>
</div>




          <button 
            type="submit" 
            disabled={loading || ingresoDisponible <= 0}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Finalizar Evaluación'}
          </button>
        </form>

        {/* Panel de Resultados en Tiempo Real */}
        <div className="bg-slate-800 text-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4 border-b border-white/10 pb-2 text-blue-400">Análisis de Capacidad</h2>
          
          <div className="space-y-6">
            <div>
              <p className="text-sm opacity-70 uppercase tracking-wider">Ingreso Disponible</p>
              <p className={`text-3xl font-bold ${ingresoDisponible > 0 ? 'text-green-400' : 'text-red-400'}`}>
                RD$ {ingresoDisponible.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm opacity-70 uppercase tracking-wider">Cuota Máxima Sugerida ({formData.porcentajeEndeudamiento}%)</p>
              <p className="text-3xl font-bold text-blue-300">
                RD$ {cuotaMaxima.toLocaleString()}
              </p>
            </div>

            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <p className="text-xs italic opacity-60">
                * Este cálculo se basa en el ingreso libre después de gastos. No se recomienda exceder la cuota sugerida para evitar mora.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}