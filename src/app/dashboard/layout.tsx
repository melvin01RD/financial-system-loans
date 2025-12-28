'use client';
import Sidebar from './components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Datos demo para el Sidebar
  const user = { name: "Admin", role: "ADMIN" };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar 
        activeTab="prestamos" 
        setActiveTab={() => {}} 
        user={user} 
        onLogout={() => {}} 
        clientes={[]} 
        creditos={[]} 
      />
      <main className="flex-1 overflow-y-auto bg-white p-6">
        {children}
      </main>
    </div>
  );
}