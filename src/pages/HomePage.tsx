import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { productApi, categoryApi, bannerApi } from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function HomePage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [bData, cData, pData] = await Promise.all([bannerApi.getAll(), categoryApi.getAll(), productApi.getAll('featured=true&limit=8')]);
        setBanners(bData.banners || []);
        setCategories(cData.categories || []);
        setFeatured(pData.products || []);
      } catch (err) { console.error('Home load error:', err); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => setCurrentBanner(p => (p + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {banners.length > 0 && (
        <div className="relative h-[400px] md:h-[500px] overflow-hidden bg-slate-800">
          <div className="absolute inset-0 transition-opacity duration-700">
            <img src={banners[currentBanner]?.banner_image} alt={banners[currentBanner]?.title} className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent" />
          </div>
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 w-full">
              <div className="max-w-lg">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">{banners[currentBanner]?.title}</h1>
                <p className="text-lg text-slate-300 mb-6">{banners[currentBanner]?.description}</p>
                <Link to="/products" className="inline-flex items-center gap-2 bg-amber-500 text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-amber-400 transition-colors">Shop Now <ArrowRight className="w-5 h-5" /></Link>
              </div>
            </div>
          </div>
          {banners.length > 1 && (<>
            <button onClick={() => setCurrentBanner(p => (p - 1 + banners.length) % banners.length)} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 rounded-full text-white hover:bg-black/50 transition"><ChevronLeft className="w-6 h-6" /></button>
            <button onClick={() => setCurrentBanner(p => (p + 1) % banners.length)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 rounded-full text-white hover:bg-black/50 transition"><ChevronRight className="w-6 h-6" /></button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, i) => <button key={i} onClick={() => setCurrentBanner(i)} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === currentBanner ? 'bg-amber-400' : 'bg-white/40'}`} />)}
            </div>
          </>)}
        </div>
      )}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-white mb-6">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(cat => (
              <Link key={cat.id} to={`/products?category=${cat.id}`} className="group bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all">
                <div className="aspect-square overflow-hidden"><img src={cat.category_image} alt={cat.category_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /></div>
                <div className="p-3 text-center"><span className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors">{cat.category_name}</span></div>
              </Link>
            ))}
          </div>
        </section>
      )}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Featured Products</h2>
            <Link to="/products?featured=true" className="text-amber-400 hover:text-amber-300 text-sm font-medium flex items-center gap-1">View All <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{featured.map((p: any) => <ProductCard key={p.id} product={p} />)}</div>
        </section>
      )}
      <section className="bg-gradient-to-r from-amber-600 to-amber-500 py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Free Shipping on Orders Above ₹500</h2>
          <p className="text-slate-800 mb-4">Shop now and save on delivery charges</p>
          <Link to="/products" className="inline-flex items-center gap-2 bg-slate-900 text-amber-400 px-6 py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors">Browse Products <ArrowRight className="w-5 h-5" /></Link>
        </div>
      </section>
    </div>
  );
}
