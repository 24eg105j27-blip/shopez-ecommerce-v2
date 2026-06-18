import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { profileApi } from '../services/api';

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', state: '', pincode: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      const addr = profile.address || {};
      setForm({ name: profile.name || '', phone: profile.phone || '', address: addr.address || '', city: addr.city || '', state: addr.state || '', pincode: addr.pincode || '' });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await profileApi.update({ name: form.name, phone: form.phone, address: { address: form.address, city: form.city, state: form.state, pincode: form.pincode } }); showToast('success', 'Profile updated!'); }
    catch { showToast('error', 'Failed to update profile'); }
    finally { setLoading(false); }
  };

  if (!user) return <div className="text-center py-20 text-slate-400">Please sign in</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">My Profile</h1>
      <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center"><User className="w-8 h-8 text-amber-400" /></div>
          <div><p className="text-white font-medium">{profile?.name || 'User'}</p><p className="text-sm text-slate-400">{user.email}</p><span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded mt-1 inline-block">{profile?.role || 'user'}</span></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm text-slate-300 mb-1.5"><User className="w-4 h-4 inline mr-1" />Full Name</label><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" /></div>
          <div><label className="block text-sm text-slate-300 mb-1.5"><Mail className="w-4 h-4 inline mr-1" />Email</label><input value={user.email || ''} disabled className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-500 text-sm cursor-not-allowed" /></div>
          <div><label className="block text-sm text-slate-300 mb-1.5"><Phone className="w-4 h-4 inline mr-1" />Phone</label><input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" placeholder="10 digits" /></div>
        </div>
        <hr className="border-slate-700" />
        <h3 className="text-white font-medium"><MapPin className="w-4 h-4 inline mr-1" />Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} className="w-full px-3 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" placeholder="Street address" /></div>
          <div><input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className="w-full px-3 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" placeholder="City" /></div>
          <div><input value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} className="w-full px-3 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" placeholder="State" /></div>
          <div><input value={form.pincode} onChange={e => setForm(p => ({ ...p, pincode: e.target.value }))} className="w-full px-3 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" placeholder="Pincode" /></div>
        </div>
        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-amber-500 text-slate-900 px-6 py-2.5 rounded-lg font-semibold hover:bg-amber-400 disabled:bg-slate-600 transition-colors"><Save className="w-4 h-4" />{loading ? 'Saving...' : 'Save Changes'}</button>
      </form>
    </div>
  );
}
