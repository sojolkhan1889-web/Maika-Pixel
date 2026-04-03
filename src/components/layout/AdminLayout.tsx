import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, Activity, LogOut, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminLayout() {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Sellers', path: '/admin/sellers', icon: Users },
    { name: 'Subscription & Billing', path: '/admin/billing', icon: CreditCard },
    { name: 'System Logs', path: '/admin/logs', icon: Activity },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary flex">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-[#0D0F14] flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 text-primary font-bold text-xl">
            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            Maika Admin
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-text-muted hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-muted hover:bg-white/5 hover:text-white transition-all"
          >
            <LogOut className="w-5 h-5" />
            Exit Admin
          </Link>
        </div>
      </aside>

      {/* Admin Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-16 border-b border-white/10 bg-[#0D0F14]/50 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
          <h2 className="text-lg font-semibold">Super Admin Panel</h2>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              SA
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8 custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
