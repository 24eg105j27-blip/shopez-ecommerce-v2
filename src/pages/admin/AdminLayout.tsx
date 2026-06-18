import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, FolderOpen, ShoppingCart, Users, Image, BarChart3 } from 'lucide-react';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: FolderOpen },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/banners', label: 'Banners', icon: Image },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function AdminLayout() {
  const location = useLocation();
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className="w-64 bg-slate-800 border-r border-slate-700 p-4 flex-shrink-0 hidden lg:block">
        <h2 className="text-lg font-bold text-amber-400 mb-4 px-3">Admin Panel</h2>
        <nav className="space-y-1">
          {navItems.map(item => {
            const isActive = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
            return <Link key={item.to} to={item.to} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-amber-500/10 text-amber-400' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}><item.icon className="w-5 h-5" />{item.label}</Link>;
          })}
        </nav>
      </aside>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 z-40 flex overflow-x-auto">
        {navItems.map(item => {
          const isActive = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
          return <Link key={item.to} to={item.to} className={`flex-1 flex flex-col items-center py-2 text-xs font-medium min-w-[64px] ${isActive ? 'text-amber-400' : 'text-slate-400'}`}><item.icon className="w-5 h-5 mb-0.5" />{item.label}</Link>;
        })}
      </div>
      <main className="flex-1 p-6 pb-20 lg:pb-6 overflow-auto"><Outlet /></main>
    </div>
  );
}
