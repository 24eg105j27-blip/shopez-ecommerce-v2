import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { bannerApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminBanners() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const { showToast } = useToast();
  const [form, setForm] = useState({ banner_image: '', title: '', description: '' });

  useEffect(() => { loadBanners(); }, []);
  async function loadBanners() { setLoading(true); try { const data = await bannerApi.getAll(); setBanners(data.banners || []); } catch {} finally { setLoading(false); } }
  function openAdd() { setEditing(null); setForm({ banner_image: '', title: '', description: '' }); setShowModal(true); }
  function openEdit(b: any) { setEditing(b); setForm({ banner_image: b.banner_image, title: b.title, description: b.description || '' }); setShowModal(true); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try { if (editing) { await bannerApi.update(editing.id, form); showToast('success', 'Banner updated'); } else { await bannerApi.create(form); showToast('success', 'Banner created'); } setShowModal(false); loadBanners(); }
    catch { showToast('error', 'Failed to save banner'); }
  }
  async function handleDelete(id: string) { if (!confirm('Delete this banner?')) return; try { await bannerApi.delete(id); showToast('success', 'Banner deleted'); loadBanners(); } catch { showToast('error', 'Failed to delete'); } }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold text-white">Banners</h1><button onClick={openAdd} className="flex items-center gap-2 bg-amber-500 text-slate-900 px-4 py-2 rounded-lg font-semibold hover:bg-amber-400 transition-colors text-sm"><Plus className="w-4 h-4" />Add Banner</button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map(b => (
          <div key={b.id} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden group hover:border-slate-600 transition-colors">
            {b.banner_image && <div className="aspect-video overflow-hidden"><img src={b.banner_image} alt={b.title} className="w-full h-full object-cover" /></div>}
            <div className="p-4"><h3 className="text-white font-medium">{b.title}</h3>{b.description && <p className="text-sm text-slate-400 mt-1">{b.description}</p>}<div className="flex gap-2 mt-3"><button onClick={() => openEdit(b)} className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg"><Pencil className="w-4 h-4" /></button><button onClick={() => handleDelete(b.id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button></div></div>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-700"><h2 className="text-lg font-bold text-white">{editing ? 'Edit Banner' : 'Add Banner'}</h2><button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button></div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div><label className="block text-sm text-slate-300 mb-1">Title</label><input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" required /></div>
              <div><label className="block text-sm text-slate-300 mb-1">Description</label><input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" /></div>
              <div><label className="block text-sm text-slate-300 mb-1">Image URL</label><input value={form.banner_image} onChange={e => setForm(p => ({ ...p, banner_image: e.target.value }))} className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" required /></div>
              <button type="submit" className="w-full bg-amber-500 text-slate-900 py-2.5 rounded-lg font-semibold hover:bg-amber-400 transition-colors">{editing ? 'Update' : 'Create'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
