'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// --- UTILIDADES DE MÁSCARA ---
const formatCedula = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 10)}-${digits.slice(10)}`;
};

const formatTelefono = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

export default function NuevoClientePage() {
  const router = useRouter();
  
  // 1. ESTADO ÚNICO DEL FORMULARIO
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    cedula: '',
    fechaNacimiento: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  // 2. TU GENERADOR DE CONTRASEÑA ORIGINAL
  const generarPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
  };

  // 3. ENVÍO AL BACKEND
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setSuccess('');
  setLoading(true);

  // KLK AQUÍ: Limpiamos los datos para que el Backend no rebote el 400
  const dataParaEnviar = {
    nombre: formData.nombre,
    apellido: formData.apellido,
    // .replace(/\D/g, '') elimina guiones y paréntesis, deja solo NÚMEROS
    cedula: formData.cedula.replace(/\D/g, ''), 
    telefono: formData.telefono.replace(/\D/g, ''),
    email: formData.email,
    direccion: formData.direccion,
    password: formData.password || "password123", 
    fecha_nacimiento: formData.fechaNacimiento // Asegúrate que la API lo espere así
  };

 try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataParaEnviar),
      });

      const resultado = await res.json();

      if (!res.ok) {
        if (resultado.detalles) {
          throw new Error(resultado.detalles[0].mensaje);
        }
        throw new Error(resultado.error || 'Error al guardar');
      }

      // ACCIÓN DE ÉXITO
      setSuccess('¡Cliente creado de manera satisfactoria!');
      
      // Limpiamos el formulario
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        direccion: '',
        cedula: '',
        fechaNacimiento: '',
        password: '',
      });

      // Quitamos el mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(''), 3000);
      
      router.refresh();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Nuevo Cliente</h2>
          <p className="text-gray-500 text-sm">Registra la información del prestamista</p>
        </div>
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-800 transition-colors">
          ← Volver atrás
        </button>
      </header>

      <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
        {/* ALERTAS DE FEEDBACK */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded flex items-center">
            <span className="mr-3">⚠️</span>
            <p className="font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded flex items-center animate-pulse">
            <span className="mr-3">✅</span>
            <p className="font-medium">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">Nombre *</label>
            <input type="text" required className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
              value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">Apellido *</label>
            <input type="text" required className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
              value={formData.apellido} onChange={(e) => setFormData({...formData, apellido: e.target.value})} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">Cédula *</label>
            <input type="text" required placeholder="001-0000000-0" className="w-full p-3 border rounded-lg font-mono outline-none focus:ring-2 focus:ring-blue-400"
              value={formData.cedula} onChange={(e) => setFormData({...formData, cedula: formatCedula(e.target.value)})} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">Teléfono *</label>
            <input type="text" required placeholder="(000) 000-0000" className="w-full p-3 border rounded-lg font-mono outline-none focus:ring-2 focus:ring-blue-400"
              value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: formatTelefono(e.target.value)})} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">Email *</label>
            <input type="email" required className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
              value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">Fecha de Nacimiento *</label>
            <input type="date" required className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
              value={formData.fechaNacimiento} onChange={(e) => setFormData({...formData, fechaNacimiento: e.target.value})} />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-gray-600">Dirección</label>
            <textarea rows={2} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
              value={formData.direccion} onChange={(e) => setFormData({...formData, direccion: e.target.value})} />
          </div>

          {/* CONTRASEÑA CON GENERADOR */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-gray-600">Contraseña (Acceso Cliente)</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={mostrarPassword ? "text" : "password"}
                  className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-3 top-3"
                >
                  {mostrarPassword ? "🙈" : "👁️"}
                </button>
              </div>
              <button
                type="button"
                onClick={generarPassword}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
              >
                Generar
              </button>
            </div>
          </div>

          <div className="md:col-span-2 pt-6 flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-4 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 shadow-lg"
            >
              {loading ? 'Guardando...' : 'Confirmar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}