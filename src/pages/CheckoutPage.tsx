import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, CreditCard, Truck, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { orderApi } from '../services/api';
import BillingBreakdown from '../components/BillingBreakdown';

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [form, setForm] = useState({ name: user?.user_metadata?.name || '', phone: '', address: '', city: '', state: '', pincode: '', paymentMethod: 'COD' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.city || !form.state || !form.pincode) { showToast('error', 'Please fill all shipping details'); return; }
    if (form.phone.length < 10) { showToast('error', 'Please enter a valid phone number'); return; }
    if (items.length === 0) { showToast('error', 'Cart is empty'); return; }
    setLoading(true);
    try {
      const data = await orderApi.create({ shippingAddress: { name: form.name, phone: form.phone, address: form.address, city: form.city, state: form.state, pincode: form.pincode }, paymentMethod: form.paymentMethod });
      setOrderId(data.order.id); clearCart(); setSuccess(true); showToast('success', 'Order placed successfully!');
    } catch (err: any) { showToast('error', err.message || 'Failed to place order'); }
    finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <CheckCircle className="w-20 h-20 mx-auto text-emerald-400 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Order Placed Successfully!</h2>
        <p className="text-slate-400 mb-2">Your order ID: {orderId.slice(0, 8)}</p>
        <p className="text-slate-400 mb-8">You will receive updates on your order status.</p>
        <div className="flex gap-4 justify-center">
          <Link to="/orders" className="bg-amber-500 text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-amber-400 transition-colors">View Orders</Link>
          <Link to="/products" className="bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-600 transition-colors">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) return <div className="max-w-lg mx-auto px-4 py-20 text-center"><h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2><Link to="/products" className="inline-block mt-4 bg-amber-500 text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-amber-400 transition-colors">Browse Products</Link></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Checkout</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4"><MapPin className="w-5 h-5 text-amber-400" /><h2 className="text-lg font-semibold text-white">Shipping Address</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm text-slate-300 mb-1">Full Name</label><input name="name" value={form.name} onChange={handleChange} className="w-full px-3 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" required /></div>
              <div><label className="block text-sm text-slate-300 mb-1">Phone</label><input name="phone" value={form.phone} onChange={handleChange} type="tel" className="w-full px-3 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" placeholder="10 digits" required /></div>
              <div className="md:col-span-2"><label className="block text-sm text-slate-300 mb-1">Address</label><input name="address" value={form.address} onChange={handleChange} className="w-full px-3 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" required /></div>
              <div><label className="block text-sm text-slate-300 mb-1">City</label><input name="city" value={form.city} onChange={handleChange} className="w-full px-3 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" required /></div>
              <div><label className="block text-sm text-slate-300 mb-1">State</label><input name="state" value={form.state} onChange={handleChange} className="w-full px-3 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" required /></div>
              <div><label className="block text-sm text-slate-300 mb-1">Pincode</label><input name="pincode" value={form.pincode} onChange={handleChange} className="w-full px-3 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" required /></div>
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4"><CreditCard className="w-5 h-5 text-amber-400" /><h2 className="text-lg font-semibold text-white">Payment Method</h2></div>
            <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${form.paymentMethod === 'COD' ? 'border-amber-500 bg-amber-500/10' : 'border-slate-600 hover:border-slate-500'}`}>
              <input type="radio" name="paymentMethod" value="COD" checked={form.paymentMethod === 'COD'} onChange={handleChange} className="accent-amber-500" />
              <Truck className="w-5 h-5 text-slate-300" /><span className="text-sm text-white font-medium">Cash on Delivery</span>
            </label>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Order Items</h2>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0">{item.product.images?.[0] && <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />}</div>
                  <div className="flex-1 min-w-0"><p className="text-sm text-white truncate">{item.product.productName}</p><p className="text-xs text-slate-400">Qty: {item.quantity}</p></div>
                  <span className="text-sm text-white font-medium">{(item.quantity * (item.product.discountPrice || item.product.price)).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <BillingBreakdown items={items} />
          <button type="submit" disabled={loading} className="w-full bg-amber-500 text-slate-900 py-3 rounded-lg font-semibold hover:bg-amber-400 disabled:bg-slate-600 transition-colors">{loading ? 'Placing Order...' : 'Place Order'}</button>
        </div>
      </form>
    </div>
  );
}
