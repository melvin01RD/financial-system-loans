'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import router from 'next/router';

export default function HistorialEvaluaciones() {
  const [evaluaciones, setEvaluaciones] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/evaluaciones')
      .then(res => res.json())
      .then(data => setEvaluaciones(data));
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Historial de Evaluaciones</h1>
        <Link 
          href="/dashboard/evaluacion/nueva" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          + Nueva Evaluación
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-gray-600">Cliente</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-600">Capacidad Pago</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-600">Cuota Máxima</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-600">Garantía</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-600">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {evaluaciones.map((eva) => (
              <tr key={eva.cliente?.nombre}className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-gray-800">{eva.cliente?.nombre} {eva.cliente?.apellido}</p>
                  <p className="text-xs text-gray-500">{eva.cliente?.cedula}</p>
                </td>
                <td className="px-6 py-4 text-green-600 font-semibold">
                  RD$ {eva.capacidadPago.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-blue-600 font-bold">
                  RD$ {eva.cuotaMaxima.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {eva.garantia || 'Sin garantía'}
                </td>
                <td className="px-6 py-4">
                 <button 
                 onClick={() => router.push(`/dashboard/prestamos/crear?evaluacionId=${eva.id}`)}
                 className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg font-bold transition-all shadow-sm"
>
                   Crear Préstamo
</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}