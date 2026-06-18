import { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { adminApi.getUsers().then(data => setUsers(data.users || [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Users</h1>
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-700 text-slate-400"><th className="text-left px-4 py-3 font-medium">Name</th><th className="text-left px-4 py-3 font-medium">Role</th><th className="text-left px-4 py-3 font-medium">Joined</th></tr></thead>
            <tbody>
              {users.map(u => <tr key={u.id} className="border-b border-slate-700/50 hover:bg-slate-700/30"><td className="px-4 py-3 text-white">{u.name || 'Unnamed'}</td><td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-300'}`}>{u.role}</span></td><td className="px-4 py-3 text-slate-400">{new Date(u.created_at).toLocaleDateString('en-IN')}</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
