'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function NuevoUsuarioPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle>Crear Nuevo Usuario del Sistema</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold">Nombre Completo</label>
              <Input placeholder="Ej: Juan Pérez" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Rol</label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Seleccionar Rol" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                  <SelectItem value="CAJERO">Cajero / Cobrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Email</label>
            <Input type="email" placeholder="usuario@yapresto.com" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Contraseña Temporal</label>
            <Input type="password" />
          </div>
          <Button className="w-full bg-blue-600 h-12">Registrar Usuario</Button>
        </CardContent>
      </Card>
    </div>
  );
}