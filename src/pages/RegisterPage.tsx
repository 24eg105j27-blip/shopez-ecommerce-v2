import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { showToast('error', 'Please fill all fields'); return; }
    if (password.length < 8) { showToast('error', 'Password must be at least 8 characters'); return; }
    if (password !== confirmPassword) { showToast('error', 'Passwords do not match'); return; }
    setLoading(true);
    try { await signUp(email, password, name); showToast('success', 'Account created! You can now sign in.'); navigate('/login'); }
    catch (err: any) { showToast('error', err.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
          <div className="text-center mb-8"><h1 className="text-2xl font-bold text-white">Create Account</h1><p className="text-slate-400 mt-2">Join ShopEZ today</p></div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" /><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" placeholder="John Doe" /></div></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" /><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" placeholder="your@email.com" /></div></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" /><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" placeholder="Min 8 characters" /></div></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" /><input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" placeholder="Re-enter password" /></div></div>
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-amber-500 text-slate-900 py-2.5 rounded-lg font-semibold hover:bg-amber-400 disabled:bg-slate-600 transition-colors"><UserPlus className="w-5 h-5" />{loading ? 'Creating account...' : 'Create Account'}</button>
          </form>
          <p className="text-center text-slate-400 text-sm mt-6">Already have an account? <Link to="/login" className="text-amber-400 hover:text-amber-300 font-medium">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
}
