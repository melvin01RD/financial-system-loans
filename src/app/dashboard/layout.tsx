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

  // ... (mismo código de imports y funciones)

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden"> {/* Fondo Slate muy claro, estilo bancario */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={onLogout} 
        clientes={[]} 
        creditos={[]} 
      />
      
      {/* QUITAMOS bg-white y ponemos bg-transparent para que use el del padre */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto"> {/* Contenedor para que el contenido no se pegue a los bordes en pantallas grandes */}
          {children}
        </div>
      </main>
    </div>
  );
}