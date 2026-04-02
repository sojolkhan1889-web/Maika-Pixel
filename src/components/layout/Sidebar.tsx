import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Target, 
  Activity,
  LineChart, 
  Settings, 
  CreditCard, 
  ClipboardList, 
  Download,
  UserCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Orders', path: '/orders', icon: ShoppingCart },
  { name: 'Customers', path: '/customers', icon: Users },
  { name: 'Pixels & Events', path: '/pixels', icon: Target },
  { name: 'Event Logs', path: '/event-logs', icon: Activity },
  { name: 'Analytics', path: '/analytics', icon: LineChart },
  { name: 'Settings', path: '/settings', icon: Settings },
  { name: 'My Account', path: '/account', icon: UserCircle },
  { name: 'Subscription', path: '/subscription', icon: CreditCard },
  { name: 'Incomplete Orders', path: '/incomplete-orders', icon: ClipboardList },
  { name: 'Export Data', path: '/export', icon: Download },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-sidebar border-r border-white/5 h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Maika Pixel
        </h1>
        <p className="text-xs text-text-muted mt-1">Server-Side Tracking</p>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
                          (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                'sidebar-item',
                isActive && 'active'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            U
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">User Account</p>
            <p className="text-xs text-text-muted truncate">Pro Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
