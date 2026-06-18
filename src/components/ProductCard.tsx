import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/billing';

interface ProductCardProps { product: any; }

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist, items } = useWishlist();
  const { showToast } = useToast();

  const id = product.id;
  const name = product.product_name || product.productName;
  const price = Number(product.price);
  const discountPrice = product.discount_price ? Number(product.discount_price) : product.discountPrice ? Number(product.discountPrice) : null;
  const images = product.images || [];
  const rating = Number(product.rating) || 0;
  const stock = product.stock ?? 0;
  const inWishlist = isInWishlist(id);
  const discount = discountPrice ? Math.round(((price - discountPrice) / price) * 100) : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    try { await addToCart(id, 1); showToast('success', 'Added to cart!'); }
    catch { showToast('error', 'Failed to add to cart'); }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    try {
      if (inWishlist) { const item = items.find(i => i.productId === id); if (item) await removeFromWishlist(item.id); showToast('info', 'Removed from wishlist'); }
      else { await addToWishlist(id); showToast('success', 'Added to wishlist!'); }
    } catch { showToast('error', 'Wishlist update failed'); }
  };

  return (
    <Link to={`/products/${id}`} className="group bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 flex flex-col">
      <div className="relative aspect-square overflow-hidden bg-slate-700">
        {images[0] ? <img src={images[0]} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center text-slate-500"><ShoppingCart className="w-12 h-12" /></div>}
        {discount > 0 && <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">{discount}% OFF</span>}
        <button onClick={handleWishlist} className="absolute top-2 right-2 p-1.5 bg-slate-900/70 rounded-full hover:bg-slate-900 transition-colors">
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-white'}`} />
        </button>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-sm font-medium text-white line-clamp-2 mb-1 group-hover:text-amber-400 transition-colors">{name}</h3>
        {rating > 0 && <div className="flex items-center gap-1 mb-2"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /><span className="text-xs text-slate-400">{rating.toFixed(1)}</span></div>}
        <div className="flex items-center gap-2 mt-auto">
          {discountPrice ? (<><span className="text-lg font-bold text-white">{formatPrice(discountPrice)}</span><span className="text-sm text-slate-500 line-through">{formatPrice(price)}</span></>)
            : <span className="text-lg font-bold text-white">{formatPrice(price)}</span>}
        </div>
        <button onClick={handleAddToCart} disabled={stock === 0} className="mt-3 w-full flex items-center justify-center gap-2 bg-amber-500 text-slate-900 py-2 rounded-lg text-sm font-semibold hover:bg-amber-400 disabled:bg-slate-600 disabled:text-slate-400 transition-colors">
          <ShoppingCart className="w-4 h-4" />{stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
}
