'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Save } from "lucide-react";

export default function ConfiguracionPage() {
  const [tasaMora, setTasaMora] = useState('5');
  const [diasGracia, setDiasGracia] = useState('3');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    const savedMora = localStorage.getItem('config_tasaMora');
    const savedDias = localStorage.getItem('config_diasGracia');
    if (savedMora) setTasaMora(savedMora);
    if (savedDias) setDiasGracia(savedDias);
  }, []);

  const handleSave = () => {
    localStorage.setItem('config_tasaMora', tasaMora);
    localStorage.setItem('config_diasGracia', diasGracia);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Configuración del Sistema</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-slate-600" /> Parámetros de Crédito
          </CardTitle>
          <CardDescription>
            Ajusta los valores predeterminados para el cálculo de mora y plazos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="tasaMora">Tasa de Mora (%)</Label>
            <Input 
              id="tasaMora" 
              type="number" 
              value={tasaMora}
              onChange={(e) => setTasaMora(e.target.value)}
              placeholder="Ej: 5"
            />
            <p className="text-xs text-slate-500">Porcentaje que se aplicará sobre la cuota vencida.</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="diasGracia">Días de Gracia</Label>
            <Input 
              id="diasGracia" 
              type="number" 
              value={diasGracia}
              onChange={(e) => setDiasGracia(e.target.value)}
              placeholder="Ej: 3"
            />
            <p className="text-xs text-slate-500">Días después del vencimiento antes de aplicar mora.</p>
          </div>

          <Button onClick={handleSave} className="w-full" disabled={saved}>
            {saved ? '¡Guardado Exitosamente!' : <><Save className="mr-2 h-4 w-4" /> Guardar Cambios</>}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
