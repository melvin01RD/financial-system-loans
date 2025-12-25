import { createClient } from "@/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

export default function CrearClientePage() {
    return (
        <div className="p-6 max-w-xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Nuevo Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={async (formData) => {
                        "use server"
                        await createClient(formData)
                    }} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nombre">Nombre Completo *</Label>
                            <Input id="nombre" name="nombre" placeholder="Ej. Juan Pérez" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="telefono">Teléfono *</Label>
                            <Input id="telefono" name="telefono" placeholder="809-555-5555" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cedula">Cédula *</Label>
                            <Input id="cedula" name="cedula" placeholder="001-0000000-0" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="direccion">Dirección</Label>
                            <Input id="direccion" name="direccion" placeholder="Calle 1, Casa 2..." />
                        </div>

                        <Button type="submit" className="w-full">
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Registrar Cliente
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
