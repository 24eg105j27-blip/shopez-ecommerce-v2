import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Minus, Plus, ArrowLeft, Truck, Shield, RotateCcw } from 'lucide-react';
import { productApi } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/billing';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist, items } = useWishlist();
  const { showToast } = useToast();

  useEffect(() => {
    if (!id) return;
    productApi.getById(id).then(data => setProduct(data)).catch(() => setProduct(null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!product) return <div className="text-center py-20 text-slate-400">Product not found</div>;

  const name = product.product_name;
  const price = Number(product.price);
  const discountPrice = product.discount_price ? Number(product.discount_price) : null;
  const images = product.images || [];
  const rating = Number(product.rating) || 0;
  const stock = product.stock ?? 0;
  const brand = product.brand;
  const description = product.description;
  const discount = discountPrice ? Math.round(((price - discountPrice) / price) * 100) : 0;
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = async () => {
    try { await addToCart(product.id, quantity); showToast('success', `${name} added to cart!`); }
    catch { showToast('error', 'Failed to add to cart'); }
  };

  const handleWishlist = async () => {
    try {
      if (inWishlist) { const item = items.find(i => i.productId === product.id); if (item) await removeFromWishlist(item.id); showToast('info', 'Removed from wishlist'); }
      else { await addToWishlist(product.id); showToast('success', 'Added to wishlist!'); }
    } catch { showToast('error', 'Wishlist update failed'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/products" className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-6 transition-colors"><ArrowLeft className="w-4 h-4" />Back to Products</Link>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="aspect-square bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
            {images[selectedImage] ? <img src={images[selectedImage]} alt={name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-slate-500"><ShoppingCart className="w-20 h-20" /></div>}
          </div>
          {images.length > 1 && <div className="flex gap-3">{images.map((img: string, i: number) => (
            <button key={i} onClick={() => setSelectedImage(i)} className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${i === selectedImage ? 'border-amber-500' : 'border-slate-700'}`}><img src={img} alt="" className="w-full h-full object-cover" /></button>
          ))}</div>}
        </div>
        <div className="space-y-5">
          <div>{brand && <span className="text-sm text-amber-400 font-medium">{brand}</span>}<h1 className="text-3xl font-bold text-white mt-1">{name}</h1></div>
          {rating > 0 && <div className="flex items-center gap-2"><div className="flex items-center gap-0.5">{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />)}</div><span className="text-sm text-slate-400">{rating.toFixed(1)}</span></div>}
          <div className="flex items-center gap-3">
            {discountPrice ? (<><span className="text-3xl font-bold text-white">{formatPrice(discountPrice)}</span><span className="text-lg text-slate-500 line-through">{formatPrice(price)}</span><span className="bg-red-500 text-white text-sm font-bold px-2 py-0.5 rounded">{discount}% OFF</span></>)
              : <span className="text-3xl font-bold text-white">{formatPrice(price)}</span>}
          </div>
          {description && <p className="text-slate-400 leading-relaxed">{description}</p>}
          <div className="flex items-center gap-2 text-sm"><span className={stock > 0 ? 'text-emerald-400' : 'text-red-400'}>{stock > 0 ? `In Stock (${stock} left)` : 'Out of Stock'}</span></div>
          {stock > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-300">Quantity:</span>
              <div className="flex items-center border border-slate-600 rounded-lg">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-2 text-slate-400 hover:text-white"><Minus className="w-4 h-4" /></button>
                <span className="w-12 text-center text-white font-medium">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(stock, q + 1))} className="p-2 text-slate-400 hover:text-white"><Plus className="w-4 h-4" /></button>
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={handleAddToCart} disabled={stock === 0} className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-slate-900 py-3 rounded-lg font-semibold hover:bg-amber-400 disabled:bg-slate-600 disabled:text-slate-400 transition-colors"><ShoppingCart className="w-5 h-5" />{stock === 0 ? 'Out of Stock' : 'Add to Cart'}</button>
            <button onClick={handleWishlist} className={`p-3 border rounded-lg transition-colors ${inWishlist ? 'border-red-500 text-red-500' : 'border-slate-600 text-slate-400 hover:text-white hover:border-slate-500'}`}><Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500' : ''}`} /></button>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 text-sm"><Truck className="w-5 h-5 text-amber-400" />Free Shipping Above ₹500</div>
            <div className="flex items-center gap-2 text-slate-400 text-sm"><Shield className="w-5 h-5 text-amber-400" />Secure Payment</div>
            <div className="flex items-center gap-2 text-slate-400 text-sm"><RotateCcw className="w-5 h-5 text-amber-400" />7-Day Returns</div>
          </div>
        </div>
      </div>
    </div>
  );
}
