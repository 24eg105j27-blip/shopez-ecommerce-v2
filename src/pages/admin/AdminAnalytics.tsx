import { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { formatPrice } from '../../utils/billing';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AdminAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { adminApi.getDashboard().then(data => setStats(data)).catch(() => {}).finally(() => setLoading(false)); }, []);

  if (loading) return <LoadingSpinner />;
  if (!stats) return <p className="text-slate-400 text-center py-10">Failed to load analytics</p>;

  const monthlySales = stats.monthlySales || {};
  const months = Object.keys(monthlySales).sort();
  const salesValues = months.map(m => monthlySales[m]);

  const barData = {
    labels: months.length > 0 ? months : ['No data'],
    datasets: [{ label: 'Revenue (₹)', data: salesValues.length > 0 ? salesValues : [0], backgroundColor: 'rgba(245, 158, 11, 0.7)', borderColor: 'rgb(245, 158, 11)', borderWidth: 1, borderRadius: 6 }],
  };

  const statusCounts = stats.statusCounts || {};
  const pieData = {
    labels: Object.keys(statusCounts).length > 0 ? Object.keys(statusCounts).map(s => s.charAt(0).toUpperCase() + s.slice(1)) : ['No data'],
    datasets: [{ data: Object.values(statusCounts).length > 0 ? Object.values(statusCounts) : [1], backgroundColor: ['rgba(245,158,11,0.7)', 'rgba(59,130,246,0.7)', 'rgba(168,85,247,0.7)', 'rgba(16,185,129,0.7)', 'rgba(239,68,68,0.7)'], borderWidth: 0 }],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { labels: { color: '#94a3b8' } } },
    scales: { x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(51,65,85,0.5)' } }, y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(51,65,85,0.5)' } } },
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Analytics</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Revenue</h3>
          <Bar data={barData} options={chartOptions} />
          {months.length === 0 && <p className="text-sm text-slate-500 text-center mt-2">No revenue data yet</p>}
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Order Status</h3>
          <div className="max-w-xs mx-auto"><Pie data={pieData} options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 16 } } } }} /></div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Top Products</h3>
          {stats.topProducts?.length > 0 ? <div className="space-y-3">{stats.topProducts.map((p: any, i: number) => <div key={i} className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">{i + 1}</span><span className="flex-1 text-sm text-slate-300">{p.name}</span><span className="text-sm text-white font-medium">{p.qty} sold</span></div>)}</div> : <p className="text-sm text-slate-500">No sales data yet</p>}
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-slate-400">Total Revenue</span><span className="text-emerald-400 font-semibold">{formatPrice(stats.totalRevenue || 0)}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Total Orders</span><span className="text-white">{stats.totalOrders || 0}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Total Products</span><span className="text-white">{stats.totalProducts || 0}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Total Users</span><span className="text-white">{stats.totalUsers || 0}</span></div>
            {stats.totalOrders > 0 && <div className="flex justify-between"><span className="text-slate-400">Avg Order Value</span><span className="text-amber-400 font-semibold">{formatPrice(stats.totalRevenue / stats.totalOrders)}</span></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
