import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';
import { orderApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/billing';
import LoadingSpinner from '../components/LoadingSpinner';

const statusColors: Record<string, string> = { pending: 'bg-amber-500/20 text-amber-400', processing: 'bg-blue-500/20 text-blue-400', shipped: 'bg-purple-500/20 text-purple-400', delivered: 'bg-emerald-500/20 text-emerald-400', cancelled: 'bg-red-500/20 text-red-400' };

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    orderApi.getAll().then(data => setOrders(data.orders || [])).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingSpinner />;
  if (!user) return <div className="text-center py-20 text-slate-400"><p>Please sign in to view your orders</p><Link to="/login" className="text-amber-400 hover:text-amber-300 mt-2 inline-block">Login</Link></div>;
  if (orders.length === 0) return <div className="max-w-7xl mx-auto px-4 py-20 text-center"><Package className="w-20 h-20 mx-auto text-slate-600 mb-4" /><h2 className="text-2xl font-bold text-white mb-2">No orders yet</h2><Link to="/products" className="text-amber-400 hover:text-amber-300">Start Shopping</Link></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Order History</h1>
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <button onClick={() => setExpanded(expanded === order.id ? null : order.id)} className="w-full flex items-center justify-between p-5 hover:bg-slate-700/50 transition-colors">
              <div><p className="text-sm text-slate-400">Order #{order.id.slice(0, 8)}</p><p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div>
              <div className="flex items-center gap-4">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[order.order_status] || 'bg-slate-700 text-slate-300'}`}>{order.order_status}</span>
                <span className="text-white font-semibold">{formatPrice(Number(order.grand_total))}</span>
                {expanded === order.id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </div>
            </button>
            {expanded === order.id && (
              <div className="border-t border-slate-700 p-5">
                <div className="space-y-3">
                  {(order.order_items || []).map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0">{item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}</div>
                      <div className="flex-1"><p className="text-sm text-white">{item.product_name}</p><p className="text-xs text-slate-400">Qty: {item.quantity} x {formatPrice(Number(item.price))}</p></div>
                      <span className="text-sm text-white">{formatPrice(item.quantity * Number(item.price))}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-slate-700 text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-slate-400">Subtotal</span><span className="text-white">{formatPrice(Number(order.total_amount))}</span></div>
                  {Number(order.discount) > 0 && <div className="flex justify-between"><span className="text-emerald-400">Discount</span><span className="text-emerald-400">-{formatPrice(Number(order.discount))}</span></div>}
                  <div className="flex justify-between"><span className="text-slate-400">Tax</span><span className="text-white">{formatPrice(Number(order.tax))}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Shipping</span><span className="text-white">{Number(order.shipping) === 0 ? <span className="text-emerald-400">FREE</span> : formatPrice(Number(order.shipping))}</span></div>
                  <div className="flex justify-between font-semibold text-base pt-1"><span className="text-white">Grand Total</span><span className="text-amber-400">{formatPrice(Number(order.grand_total))}</span></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
