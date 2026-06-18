import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/billing';
import LoadingSpinner from '../components/LoadingSpinner';

export default function WishlistPage() {
  const { items, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  if (loading) return <LoadingSpinner />;
  if (!user) return <div className="text-center py-20 text-slate-400"><p>Please sign in to view your wishlist</p><Link to="/login" className="text-amber-400 hover:text-amber-300 mt-2 inline-block">Login</Link></div>;
  if (items.length === 0) return <div className="max-w-7xl mx-auto px-4 py-20 text-center"><Heart className="w-20 h-20 mx-auto text-slate-600 mb-4" /><h2 className="text-2xl font-bold text-white mb-2">Wishlist is empty</h2><Link to="/products" className="text-amber-400 hover:text-amber-300">Browse Products</Link></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">My Wishlist ({items.length})</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(item => {
          const discount = item.product.discountPrice ? Math.round(((item.product.price - item.product.discountPrice) / item.product.price) * 100) : 0;
          return (
            <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden group">
              <Link to={`/products/${item.productId}`} className="block">
                <div className="aspect-square overflow-hidden bg-slate-700">
                  {item.product.images?.[0] ? <img src={item.product.images[0]} alt={item.product.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full flex items-center justify-center text-slate-500"><ShoppingCart className="w-10 h-10" /></div>}
                </div>
              </Link>
              <div className="p-4">
                <Link to={`/products/${item.productId}`} className="text-sm font-medium text-white line-clamp-2 hover:text-amber-400 transition-colors">{item.product.productName}</Link>
                <div className="flex items-center gap-2 mt-1.5">
                  {item.product.discountPrice ? (<><span className="font-bold text-white">{formatPrice(item.product.discountPrice)}</span><span className="text-xs text-slate-500 line-through">{formatPrice(item.product.price)}</span></>)
                    : <span className="font-bold text-white">{formatPrice(item.product.price)}</span>}
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={async () => { try { await addToCart(item.productId, 1); showToast('success', 'Added to cart!'); } catch { showToast('error', 'Failed to add'); } }} disabled={item.product.stock === 0} className="flex-1 flex items-center justify-center gap-1 bg-amber-500 text-slate-900 py-1.5 rounded-lg text-xs font-semibold hover:bg-amber-400 disabled:bg-slate-600 disabled:text-slate-400 transition-colors"><ShoppingCart className="w-3.5 h-3.5" />{item.product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</button>
                  <button onClick={() => removeFromWishlist(item.id)} className="p-1.5 border border-slate-600 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"><Heart className="w-4 h-4 fill-red-400" /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
