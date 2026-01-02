'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function CrearClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    telefono: '',
    email: '',
    direccion: '',
    fecha_nacimiento: '',
    password: 'client123', 
  });

  // Función para manejar el cambio y aplicar máscara de solo números
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Si es cédula o teléfono, solo permitimos números y limitamos largo
    if (name === 'cedula' || name === 'telefono') {
      const onlyNums = value.replace(/[^0-9]/g, '');
      const limit = name === 'cedula' ? 11 : 10;
      setFormData({ ...formData, [name]: onlyNums.slice(0, limit) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación manual antes de enviar
    if (formData.cedula.length !== 11) {
      setError('La cédula debe tener exactamente 11 dígitos numéricos.');
      return;
    }
    if (formData.telefono.length !== 10) {
      setError('El teléfono debe tener exactamente 10 dígitos numéricos.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setFormData({
          nombre: '', apellido: '', cedula: '', telefono: '',
          email: '', direccion: '', fecha_nacimiento: '', password: 'client123',
        });
        // Desaparece en 4 segundos
        setTimeout(() => setSuccess(false), 4000);
      } else {
        setError(data.error || 'Error al crear el cliente');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button variant="ghost" onClick={() => router.push('/dashboard/clientes')} className="mb-4 text-gray-600">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver al listado
      </Button>

      <Card className="border-t-4 border-blue-600 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <UserPlus className="text-blue-600" /> Registrar Nuevo Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="text-green-500 h-6 w-6" />
              <div>
                <p className="font-bold">¡Cliente creado con éxito!</p>
                <p className="text-sm">El registro se completó correctamente.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-3">
              <AlertCircle className="text-red-500 h-6 w-6" />
              <p className="font-medium text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input name="nombre" required value={formData.nombre} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label>Apellido</Label>
                <Input name="apellido" required value={formData.apellido} onChange={handleInputChange} />
              </div>
              
              <div className="space-y-2">
                <Label>Cédula (Sin guiones - 11 dígitos)</Label>
                <Input 
                  name="cedula" 
                  placeholder="Ej: 00123456789" 
                  required 
                  value={formData.cedula} 
                  onChange={handleInputChange}
                  className={formData.cedula.length > 0 && formData.cedula.length < 11 ? "border-orange-400" : ""}
                />
                <p className="text-[10px] text-gray-500">{formData.cedula.length}/11 dígitos</p>
              </div>

              <div className="space-y-2">
                <Label>Teléfono (10 dígitos)</Label>
                <Input 
                  name="telefono" 
                  placeholder="Ej: 8091234567" 
                  required 
                  value={formData.telefono} 
                  onChange={handleInputChange}
                  className={formData.telefono.length > 0 && formData.telefono.length < 10 ? "border-orange-400" : ""}
                />
                <p className="text-[10px] text-gray-500">{formData.telefono.length}/10 dígitos</p>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input name="email" type="email" required value={formData.email} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label>Fecha de Nacimiento</Label>
                <Input name="fecha_nacimiento" type="date" required value={formData.fecha_nacimiento} onChange={handleInputChange} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input name="direccion" value={formData.direccion} onChange={handleInputChange} />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-white font-bold" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2" /> : 'Registrar Cliente'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}