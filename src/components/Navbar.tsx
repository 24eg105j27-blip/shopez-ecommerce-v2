import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Menu, X, LogOut, Shield, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, profile, signOut, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold tracking-tight text-amber-400 hover:text-amber-300 transition-colors">ShopEZ</Link>
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
            </div>
          </form>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/products" className="text-sm text-slate-300 hover:text-white transition-colors">Products</Link>
            {user && <Link to="/wishlist" className="relative text-slate-300 hover:text-white transition-colors"><Heart className="w-5 h-5" /></Link>}
            <Link to="/cart" className="relative text-slate-300 hover:text-white transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && <span className="absolute -top-2 -right-2 bg-amber-500 text-slate-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{itemCount}</span>}
            </Link>
            {user ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                  <User className="w-5 h-5" /><span className="text-sm">{profile?.name || 'Account'}</span>
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 py-1">
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"><User className="w-4 h-4" />Profile</Link>
                      <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"><Package className="w-4 h-4" />Orders</Link>
                      {isAdmin && <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-amber-400 hover:bg-slate-700"><Shield className="w-4 h-4" />Admin</Link>}
                      <hr className="border-slate-700 my-1" />
                      <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-700 w-full"><LogOut className="w-4 h-4" />Sign Out</button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm text-slate-300 hover:text-white transition-colors">Login</Link>
                <Link to="/register" className="text-sm bg-amber-500 text-slate-900 px-4 py-1.5 rounded-lg font-medium hover:bg-amber-400 transition-colors">Sign Up</Link>
              </div>
            )}
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-slate-300">{mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
        </div>
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white" />
            </form>
            <Link to="/products" onClick={() => setMobileOpen(false)} className="block text-slate-300 hover:text-white py-1">Products</Link>
            {user ? (
              <>
                <Link to="/cart" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-slate-300 hover:text-white py-1"><ShoppingCart className="w-4 h-4" />Cart ({itemCount})</Link>
                <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-slate-300 hover:text-white py-1"><Heart className="w-4 h-4" />Wishlist</Link>
                <Link to="/orders" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-slate-300 hover:text-white py-1"><Package className="w-4 h-4" />Orders</Link>
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-slate-300 hover:text-white py-1"><User className="w-4 h-4" />Profile</Link>
                {isAdmin && <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-amber-400 py-1"><Shield className="w-4 h-4" />Admin</Link>}
                <button onClick={handleSignOut} className="flex items-center gap-2 text-red-400 py-1"><LogOut className="w-4 h-4" />Sign Out</button>
              </>
            ) : (
              <div className="flex gap-4 pt-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="text-slate-300">Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="text-amber-400 font-medium">Sign Up</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
