import { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatPrice } from '../../utils/billing';
import LoadingSpinner from '../../components/LoadingSpinner';

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const statusColors: Record<string, string> = { pending: 'bg-amber-500/20 text-amber-400', processing: 'bg-blue-500/20 text-blue-400', shipped: 'bg-purple-500/20 text-purple-400', delivered: 'bg-emerald-500/20 text-emerald-400', cancelled: 'bg-red-500/20 text-red-400' };

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => { loadOrders(); }, []);
  async function loadOrders() { setLoading(true); try { const data = await adminApi.getOrders(); setOrders(data.orders || []); } catch {} finally { setLoading(false); } }

  async function updateStatus(orderId: string, status: string) {
    try { await adminApi.updateOrder(orderId, { order_status: status }); showToast('success', `Order status updated to ${status}`); loadOrders(); }
    catch { showToast('error', 'Failed to update order'); }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Orders</h1>
      {orders.length === 0 ? <p className="text-slate-400 text-center py-10">No orders yet</p> : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div><p className="text-sm text-slate-400">Order #{order.id.slice(0, 8)}</p><p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleString('en-IN')}</p>{order.profiles && <p className="text-xs text-slate-400 mt-1">{order.profiles.name} ({order.profiles.email})</p>}</div>
                <div className="flex items-center gap-3">
                  <select value={order.order_status} onChange={e => updateStatus(order.id, e.target.value)} className="px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500">{statusOptions.map(s => <option key={s} value={s}>{s}</option>)}</select>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[order.order_status]}`}>{order.order_status}</span>
                </div>
              </div>
              <div className="space-y-2 mb-3">{(order.order_items || []).map((item: any) => <div key={item.id} className="flex items-center gap-3 text-sm">{item.image && <img src={item.image} alt="" className="w-8 h-8 rounded object-cover" />}<span className="text-slate-300 flex-1">{item.product_name} x{item.quantity}</span><span className="text-white">{formatPrice(Number(item.price))}</span></div>)}</div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-700 text-sm"><span className="text-slate-400">Grand Total</span><span className="text-amber-400 font-semibold">{formatPrice(Number(order.grand_total))}</span></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
