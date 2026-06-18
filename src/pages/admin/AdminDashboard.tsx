import { useState, useEffect } from 'react';
import { DollarSign, Package, Users, ShoppingCart } from 'lucide-react';
import { adminApi } from '../../services/api';
import { formatPrice } from '../../utils/billing';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { adminApi.getDashboard().then(data => setStats(data)).catch(() => {}).finally(() => setLoading(false)); }, []);

  if (loading) return <LoadingSpinner />;

  const cards = [
    { label: 'Total Revenue', value: formatPrice(stats?.totalRevenue || 0), icon: DollarSign, color: 'text-emerald-400 bg-emerald-500/10' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: ShoppingCart, color: 'text-blue-400 bg-blue-500/10' },
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: Package, color: 'text-amber-400 bg-amber-500/10' },
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-purple-400 bg-purple-500/10' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3"><span className="text-sm text-slate-400">{card.label}</span><div className={`p-2 rounded-lg ${card.color}`}><card.icon className="w-5 h-5" /></div></div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Top Products</h3>
          {stats?.topProducts?.length > 0 ? <div className="space-y-3">{stats.topProducts.map((p: any, i: number) => <div key={i} className="flex items-center justify-between"><span className="text-sm text-slate-300">{p.name}</span><span className="text-sm text-amber-400 font-medium">{p.qty} sold</span></div>)}</div> : <p className="text-sm text-slate-500">No sales data yet</p>}
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Order Status</h3>
          {stats?.statusCounts && Object.keys(stats.statusCounts).length > 0 ? <div className="space-y-3">{Object.entries(stats.statusCounts).map(([status, count]: [string, any]) => <div key={status} className="flex items-center justify-between"><span className="text-sm text-slate-300 capitalize">{status}</span><span className="text-sm text-white font-medium">{count}</span></div>)}</div> : <p className="text-sm text-slate-500">No orders yet</p>}
        </div>
      </div>
    </div>
  );
}
