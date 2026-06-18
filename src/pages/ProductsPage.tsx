import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { productApi, categoryApi } from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const featured = searchParams.get('featured') || '';
  const sort = searchParams.get('sort') || '';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => { categoryApi.getAll().then(data => setCategories(data.categories || [])).catch(() => {}); }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (category) params.set('category', category);
        if (featured) params.set('featured', featured);
        if (sort) params.set('sort', sort);
        params.set('page', String(page)); params.set('limit', '12');
        const data = await productApi.getAll(params.toString());
        setProducts(data.products || []); setTotal(data.total || 0);
      } catch (err) { console.error('Products load error:', err); }
      finally { setLoading(false); }
    }
    load();
  }, [search, category, featured, sort, page]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page'); setSearchParams(next);
  };

  const totalPages = Math.ceil(total / 12);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">{featured ? 'Featured Products' : search ? `Results for "${search}"` : 'All Products'}</h1>
        <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:text-white hover:border-amber-500/50 transition-colors"><SlidersHorizontal className="w-4 h-4" />Filters</button>
      </div>
      {showFilters && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Search</label><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><input type="text" value={search} onChange={e => updateParam('search', e.target.value)} className="w-full pl-10 pr-8 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500" placeholder="Search..." />{search && <button onClick={() => updateParam('search', '')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>}</div></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Category</label><select value={category} onChange={e => updateParam('category', e.target.value)} className="w-full py-2 px-3 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"><option value="">All Categories</option>{categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Sort By</label><select value={sort} onChange={e => updateParam('sort', e.target.value)} className="w-full py-2 px-3 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"><option value="">Newest</option><option value="price_asc">Price: Low to High</option><option value="price_desc">Price: High to Low</option><option value="rating">Top Rated</option></select></div>
          </div>
        </div>
      )}
      {loading ? <LoadingSpinner /> : (
        <>
          {products.length === 0 ? (
            <div className="text-center py-20 text-slate-400"><Search className="w-16 h-16 mx-auto mb-4 opacity-30" /><p className="text-lg">No products found</p><p className="text-sm mt-1">Try adjusting your search or filters</p></div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => updateParam('page', String(p))} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>{p}</button>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
