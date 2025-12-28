'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: 'overview' | 'clientes' | 'evaluacion' | 'creditos' | 'pagos' | 'cuotas' | 'reportes' | 'configuracion' | 'perfil' | 'empresas' | 'usuarios' | 'prestamos' | 'configuracion-creditos') => void;
  user: any;
  onLogout: () => void;
  clientes: any[];
  creditos: any[];
}

function adjustColor(color: string, amount: number): string {
  const clamp = (num: number) => Math.min(Math.max(num, 0), 255);
  const num = parseInt(color.replace('#', ''), 16);
  const r = clamp((num >> 16) + amount);
  const g = clamp(((num >> 8) & 0x00FF) + amount);
  const b = clamp((num & 0x0000FF) + amount);
  return `#${(0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export default function Sidebar({ activeTab, setActiveTab, user, onLogout, clientes, creditos }: SidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter(); // El router se declara aquí adentro

  const primaryColor = user?.empresaActiva?.color || '#2563eb';

  const menuItems = [
    { id: 'overview', name: 'Panel Principal', icon: 'fa-solid fa-chart-line', description: 'Vista general' },
    { id: 'clientes', name: 'Clientes', icon: 'fa-solid fa-users', badge: clientes.length, description: 'Gestionar clientes' },
    { id: 'prestamos', name: 'Préstamos', icon: 'fa-solid fa-calculator', description: 'Crear y ver préstamos' },
    {id: 'evaluacion', name: 'Evaluación', icon: 'fa-solid fa-magnifying-glass-chart', description: 'Análisis de riesgo' }, 
    { id: 'creditos', name: 'Créditos', icon: 'fa-solid fa-money-bill-wave', badge: creditos.length, description: 'Gestionar créditos' },
    { id: 'pagos', name: 'Pagos', icon: 'fa-solid fa-hand-holding-dollar', description: 'Registrar pagos' },
    { id: 'cuotas', name: 'Cuotas', icon: 'fa-solid fa-list-check', description: 'Ver todas las cuotas' },
    { id: 'empresas', name: 'Empresas', icon: 'fa-solid fa-building', description: 'Gestionar empresas' },
    { id: 'usuarios', name: 'Usuarios', icon: 'fa-solid fa-user', description: 'Gestionar usuarios' },
    { id: 'configuracion-creditos', name: 'Conf. Créditos', icon: 'fa-solid fa-gear', description: 'Configurar créditos' }
  ];

 const handleNavigation = (itemId: string) => {
    setActiveTab(itemId as any);
    
    if (itemId === 'prestamos') {
      router.push('/dashboard/prestamos/crear'); // Ruta correcta para préstamos
    } else if (itemId === 'clientes') {
      router.push('/dashboard/clientes/nuevo');  // Ruta correcta para clientes
    } else {
      router.push(`/dashboard?tab=${itemId}`);   // El resto se queda en el dashboard
    }
  };

  return (
    <>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md text-white"
        style={{ backgroundColor: primaryColor }}
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      <div
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 text-white transition-transform duration-300 ease-in-out flex flex-col`}
        style={{ background: `linear-gradient(to bottom, ${primaryColor}, ${adjustColor(primaryColor, -20)}, ${primaryColor})` }}
      >
        <div className="p-6 border-b" style={{ borderColor: adjustColor(primaryColor, -30) }}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: adjustColor(primaryColor, 30) }}>
              <i className="fa-solid fa-credit-card text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold">YaPresto</h1>
              <p className="text-xs opacity-90" style={{ color: adjustColor(primaryColor, 100) }}>Sistema de Créditos</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`${activeTab === item.id ? 'text-white' : 'hover:bg-white/10'} group flex items-center w-full px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-150`}
              style={activeTab === item.id ? { backgroundColor: adjustColor(primaryColor, -30) } : { color: 'rgba(255, 255, 255, 0.9)' }}
            >
              <i className={`${item.icon} text-lg mr-3`}></i>
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <span>{item.name}</span>
                  {item.badge !== undefined && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full text-white" style={{ backgroundColor: adjustColor(primaryColor, 30) }}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs opacity-85 mt-0.5" style={{ color: adjustColor(primaryColor, 100) }}>{item.description}</p>
              </div>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t space-y-2" style={{ borderColor: adjustColor(primaryColor, -30) }}>
          <button
            onClick={onLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium hover:bg-red-600 rounded-lg transition-colors duration-150"
            style={{ color: 'rgba(255, 255, 255, 0.9)' }}
          >
            <i className="fa-solid fa-right-from-bracket text-lg mr-3"></i>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {sidebarOpen && <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setSidebarOpen(false)} />}
    </>
  );
}