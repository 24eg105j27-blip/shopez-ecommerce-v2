import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import BillingBreakdown from '../components/BillingBreakdown';
import { formatPrice } from '../utils/billing';

export default function CartPage() {
  const { items, loading, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-20 h-20 mx-auto text-slate-600 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
        <p className="text-slate-400 mb-6">Looks like you haven't added anything yet</p>
        <Link to="/products" className="inline-flex items-center gap-2 bg-amber-500 text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-amber-400 transition-colors">Start Shopping <ArrowRight className="w-5 h-5" /></Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Shopping Cart ({items.length} items)</h1>
      {!user && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3 mb-6 text-sm text-amber-400">
          Sign in to save your cart across devices. <Link to="/login" className="underline font-medium">Login</Link>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => {
            const effectivePrice = item.product.discountPrice || item.product.price;
            return (
              <div key={item.id} className="flex gap-4 bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors">
                <Link to={`/products/${item.productId}`} className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden bg-slate-700">
                  {item.product.images?.[0] ? <img src={item.product.images[0]} alt={item.product.productName} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-500"><ShoppingBag className="w-8 h-8" /></div>}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.productId}`} className="text-white font-medium hover:text-amber-400 transition-colors line-clamp-2">{item.product.productName}</Link>
                  {item.product.brand && <p className="text-xs text-amber-400 mt-0.5">{item.product.brand}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    {item.product.discountPrice ? (<><span className="font-bold text-white">{formatPrice(item.product.discountPrice)}</span><span className="text-sm text-slate-500 line-through">{formatPrice(item.product.price)}</span></>)
                      : <span className="font-bold text-white">{formatPrice(item.product.price)}</span>}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-slate-600 rounded-lg">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 text-slate-400 hover:text-white transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                      <span className="w-10 text-center text-white text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, Math.min(item.product.stock, item.quantity + 1))} className="p-1.5 text-slate-400 hover:text-white transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-white font-semibold">{formatPrice(item.quantity * effectivePrice)}</span>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-300 p-1 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="space-y-4">
          <BillingBreakdown items={items} />
          <Link to="/checkout" className="block w-full text-center bg-amber-500 text-slate-900 py-3 rounded-lg font-semibold hover:bg-amber-400 transition-colors">Proceed to Checkout</Link>
          <Link to="/products" className="block text-center text-slate-400 hover:text-white text-sm transition-colors">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
