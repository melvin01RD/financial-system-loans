'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, Phone, Mail, User } from "lucide-react";

export default function EmpresaPage() {
  // Simulating user/company data from "User" or LocalStorage as requested
  // In a real app, this would come from the API/Session
  const user = {
    nombre: "Administrador",
    empresa: "Financiera YaPresto",
    rol: "ADMIN",
    email: "admin@yapresto.com"
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Perfil de Empresa</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" /> Información del Negocio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Nombre Comercial</span>
              <span className="font-medium">{user.empresa}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">RNC / Identificación</span>
              <span className="font-medium">1-01-00000-0</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Dirección</span>
              <span className="font-medium flex items-center gap-1"><MapPin size={14}/> Av. Central #123</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Teléfono</span>
              <span className="font-medium flex items-center gap-1"><Phone size={14}/> (809) 555-0100</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" /> Usuario Activo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Nombre</span>
              <span className="font-medium">{user.nombre}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Rol</span>
              <Badge>{user.rol}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Email</span>
              <span className="font-medium flex items-center gap-1"><Mail size={14}/> {user.email}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
