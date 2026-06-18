import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { categoryApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const { showToast } = useToast();
  const [form, setForm] = useState({ category_name: '', category_image: '' });

  useEffect(() => { loadCategories(); }, []);
  async function loadCategories() { setLoading(true); try { const data = await categoryApi.getAll(); setCategories(data.categories || []); } catch {} finally { setLoading(false); } }
  function openAdd() { setEditing(null); setForm({ category_name: '', category_image: '' }); setShowModal(true); }
  function openEdit(c: any) { setEditing(c); setForm({ category_name: c.category_name, category_image: c.category_image || '' }); setShowModal(true); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try { if (editing) { await categoryApi.update(editing.id, form); showToast('success', 'Category updated'); } else { await categoryApi.create(form); showToast('success', 'Category created'); } setShowModal(false); loadCategories(); }
    catch { showToast('error', 'Failed to save category'); }
  }
  async function handleDelete(id: string) { if (!confirm('Delete this category?')) return; try { await categoryApi.delete(id); showToast('success', 'Category deleted'); loadCategories(); } catch { showToast('error', 'Failed to delete'); } }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold text-white">Categories</h1><button onClick={openAdd} className="flex items-center gap-2 bg-amber-500 text-slate-900 px-4 py-2 rounded-lg font-semibold hover:bg-amber-400 transition-colors text-sm"><Plus className="w-4 h-4" />Add Category</button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(c => (
          <div key={c.id} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden group hover:border-slate-600 transition-colors">
            {c.category_image && <div className="aspect-video overflow-hidden"><img src={c.category_image} alt={c.category_name} className="w-full h-full object-cover" /></div>}
            <div className="p-4 flex items-center justify-between"><span className="text-white font-medium">{c.category_name}</span><div className="flex gap-2"><button onClick={() => openEdit(c)} className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg"><Pencil className="w-4 h-4" /></button><button onClick={() => handleDelete(c.id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button></div></div>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-700"><h2 className="text-lg font-bold text-white">{editing ? 'Edit Category' : 'Add Category'}</h2><button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button></div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div><label className="block text-sm text-slate-300 mb-1">Category Name</label><input value={form.category_name} onChange={e => setForm(p => ({ ...p, category_name: e.target.value }))} className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" required /></div>
              <div><label className="block text-sm text-slate-300 mb-1">Image URL</label><input value={form.category_image} onChange={e => setForm(p => ({ ...p, category_image: e.target.value }))} className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" /></div>
              <button type="submit" className="w-full bg-amber-500 text-slate-900 py-2.5 rounded-lg font-semibold hover:bg-amber-400 transition-colors">{editing ? 'Update' : 'Create'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
