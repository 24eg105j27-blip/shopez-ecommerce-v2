import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { productApi, categoryApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatPrice } from '../../utils/billing';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const { showToast } = useToast();
  const emptyForm = { product_name: '', description: '', category_id: '', brand: '', price: '', discount_price: '', stock: '', images: '', featured: false };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { loadProducts(); categoryApi.getAll().then(d => setCategories(d.categories || [])).catch(() => {}); }, []);

  async function loadProducts() {
    setLoading(true);
    try { const data = await productApi.getAll('limit=100'); setProducts(data.products || []); } catch {} finally { setLoading(false); }
  }

  function openAdd() { setEditing(null); setForm(emptyForm); setShowModal(true); }
  function openEdit(p: any) { setEditing(p); setForm({ product_name: p.product_name || '', description: p.description || '', category_id: p.category_id || '', brand: p.brand || '', price: String(p.price || ''), discount_price: p.discount_price ? String(p.discount_price) : '', stock: String(p.stock || ''), images: (p.images || []).join(', '), featured: p.featured || false }); setShowModal(true); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { product_name: form.product_name, description: form.description, category_id: form.category_id || null, brand: form.brand, price: Number(form.price), discount_price: form.discount_price ? Number(form.discount_price) : null, stock: Number(form.stock), images: form.images ? form.images.split(',').map((s: string) => s.trim()).filter(Boolean) : [], featured: form.featured };
    try {
      if (editing) { await productApi.update(editing.id, payload); showToast('success', 'Product updated'); }
      else { await productApi.create(payload); showToast('success', 'Product created'); }
      setShowModal(false); loadProducts();
    } catch { showToast('error', 'Failed to save product'); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return;
    try { await productApi.delete(id); showToast('success', 'Product deleted'); loadProducts(); } catch { showToast('error', 'Failed to delete'); }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Products</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-amber-500 text-slate-900 px-4 py-2 rounded-lg font-semibold hover:bg-amber-400 transition-colors text-sm"><Plus className="w-4 h-4" />Add Product</button>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-700 text-slate-400"><th className="text-left px-4 py-3 font-medium">Product</th><th className="text-left px-4 py-3 font-medium">Category</th><th className="text-left px-4 py-3 font-medium">Price</th><th className="text-left px-4 py-3 font-medium">Stock</th><th className="text-left px-4 py-3 font-medium">Actions</th></tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="px-4 py-3"><div className="flex items-center gap-3">{p.images?.[0] && <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />}<div><p className="text-white font-medium">{p.product_name}</p>{p.brand && <p className="text-xs text-slate-500">{p.brand}</p>}</div></div></td>
                  <td className="px-4 py-3 text-slate-300">{p.category?.category_name || '-'}</td>
                  <td className="px-4 py-3"><span className="text-white">{formatPrice(Number(p.price))}</span>{p.discount_price && <span className="ml-2 text-xs text-emerald-400">{formatPrice(Number(p.discount_price))}</span>}</td>
                  <td className="px-4 py-3"><span className={p.stock > 0 ? 'text-emerald-400' : 'text-red-400'}>{p.stock}</span></td>
                  <td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => openEdit(p)} className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg"><Pencil className="w-4 h-4" /></button><button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-700"><h2 className="text-lg font-bold text-white">{editing ? 'Edit Product' : 'Add Product'}</h2><button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button></div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div><label className="block text-sm text-slate-300 mb-1">Name</label><input value={form.product_name} onChange={e => setForm(p => ({ ...p, product_name: e.target.value }))} className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" required /></div>
              <div><label className="block text-sm text-slate-300 mb-1">Description</label><textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-slate-300 mb-1">Category</label><select value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))} className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"><option value="">None</option>{categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}</select></div>
                <div><label className="block text-sm text-slate-300 mb-1">Brand</label><input value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))} className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm text-slate-300 mb-1">Price</label><input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" required /></div>
                <div><label className="block text-sm text-slate-300 mb-1">Discount Price</label><input type="number" value={form.discount_price} onChange={e => setForm(p => ({ ...p, discount_price: e.target.value }))} className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" /></div>
                <div><label className="block text-sm text-slate-300 mb-1">Stock</label><input type="number" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" required /></div>
              </div>
              <div><label className="block text-sm text-slate-300 mb-1">Images (comma-separated URLs)</label><input value={form.images} onChange={e => setForm(p => ({ ...p, images: e.target.value }))} className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" placeholder="https://..., https://..." /></div>
              <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={form.featured} onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))} className="accent-amber-500" />Featured</label>
              <button type="submit" className="w-full bg-amber-500 text-slate-900 py-2.5 rounded-lg font-semibold hover:bg-amber-400 transition-colors">{editing ? 'Update Product' : 'Create Product'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
