'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Importamos el router
import Sidebar from './components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter(); // Inicializamos el router
  
  // Maneja el tab activo con un estado
  const [activeTab, setActiveTab] = useState('overview'); 
  
  // Aquí puedes simular el usuario o traerlo del localStorage luego
  const user = { name: "Admin", role: "ADMIN", email: "admin@yapresto.com" };

  // --- AQUÍ PEGAMOS LA LÓGICA DE CERRAR SESIÓN ---
  const onLogout = () => {
    // 1. Borramos los datos de sesión
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // 2. Limpiamos la cookie por si acaso
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    // 3. Mandamos pal' login de una vez
    router.push('/login');
    
    // 4. Opcional: refrescamos la página para limpiar cualquier estado de React
    router.refresh();
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={onLogout} // <--- Ahora sí le pasamos la función real
        clientes={[]} 
        creditos={[]} 
      />
      <main className="flex-1 overflow-y-auto bg-white p-6">
        {children}
      </main>
    </div>
  );
}