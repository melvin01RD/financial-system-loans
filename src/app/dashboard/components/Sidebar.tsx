'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  user: any;
  onLogout: () => void;
  clientes: any[];
  creditos: any[];
}

// Función auxiliar para ajustar colores (puedes moverla a @/lib/utils si prefieres)
function adjustColor(color: string, amount: number): string {
  const clamp = (num: number) => Math.min(Math.max(num, 0), 255);
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = clamp((num >> 16) + amount);
  const g = clamp(((num >> 8) & 0x00FF) + amount);
  const b = clamp((num & 0x0000FF) + amount);
  return `#${(0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export default function Sidebar({ activeTab, setActiveTab, user, clientes, creditos }: SidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Por defecto cerrado en móvil
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const primaryColor = user?.empresaActiva?.color || '#2563eb';

  // Lógica de Logout integrada
  const handleLogout = async () => {
    if (!confirm('¿Estás seguro de que deseas cerrar sesión?')) return;
    
    setIsLoggingOut(true);
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        localStorage.removeItem('user');
        router.push('/login');
        router.refresh();
      }
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const menuItems = [
    { id: 'overview', name: 'Panel Principal', icon: 'fa-solid fa-chart-line', description: 'Vista general' },
    { id: 'clientes', name: 'Clientes', icon: 'fa-solid fa-users', badge: clientes.length, description: 'Gestionar clientes' },
    { id: 'prestamos', name: 'Préstamos', icon: 'fa-solid fa-calculator', description: 'Crear y ver préstamos' },
    { id: 'evaluacion', name: 'Evaluación', icon: 'fa-solid fa-magnifying-glass-chart', description: 'Análisis de riesgo' },
    { id: 'creditos', name: 'Créditos', icon: 'fa-solid fa-money-bill-wave', badge: creditos.length, description: 'Gestionar créditos' },
    { id: 'pagos', name: 'Pagos', icon: 'fa-solid fa-hand-holding-dollar', description: 'Registrar pagos' },
    { id: 'cuotas', name: 'Cuotas', icon: 'fa-solid fa-list-check', description: 'Ver todas las cuotas' },
    { id: 'empresas', name: 'Empresas', icon: 'fa-solid fa-building', description: 'Gestionar empresas' },
    { id: 'usuarios', name: 'Usuarios', icon: 'fa-solid fa-user', description: 'Gestionar usuarios' },
    { id: 'configuracion-creditos', name: 'Conf. Créditos', icon: 'fa-solid fa-gear', description: 'Configurar créditos' }
  ];

  const handleNavigation = (itemId: string) => {
    setActiveTab(itemId);
    setSidebarOpen(false); // Cerrar en móvil tras click

    const routes: Record<string, string> = {
      'prestamos': '/dashboard/prestamos/crear',
      'clientes': '/dashboard/clientes/nuevo',
    };

    const targetRoute = routes[itemId] || `/dashboard?tab=${itemId}`;
    router.push(targetRoute);
  };

  return (
    <>
      {/* Botón Móvil */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl text-white shadow-lg"
        style={{ backgroundColor: primaryColor }}
      >
        <i className={`fa-solid ${sidebarOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
      </button>

      {/* Overlay Móvil */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 text-white transition-all duration-300 ease-in-out flex flex-col shadow-2xl
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ 
          background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -25)})` 
        }}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner" 
                 style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <i className="fa-solid fa-sack-dollar text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">YaPresto</h1>
              <p className="text-[10px] uppercase tracking-widest opacity-70">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
                ${activeTab === item.id 
                  ? 'bg-white text-slate-900 shadow-lg scale-[1.02]' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
            >
              <i className={`${item.icon} text-lg mr-3 w-6`}></i>
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <span>{item.name}</span>
                  {item.badge ? (
                    <span className="ml-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/20">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                <p className={`text-[10px] ${activeTab === item.id ? 'text-slate-500' : 'text-white/50'}`}>
                  {item.description}
                </p>
              </div>
            </button>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-white/10 bg-black/10">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30 text-xs font-bold">
              {user?.nombre?.charAt(0) || 'U'}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold truncate">{user?.nombre || 'Usuario'}</p>
              <p className="text-[10px] opacity-60 truncate">{user?.email}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-bold bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white rounded-xl transition-all duration-200 group"
          >
            {isLoggingOut ? (
              <i className="fa-solid fa-circle-notch animate-spin"></i>
            ) : (
              <>
                <i className="fa-solid fa-right-from-bracket mr-2 group-hover:translate-x-1 transition-transform"></i>
                <span>Cerrar Sesión</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}