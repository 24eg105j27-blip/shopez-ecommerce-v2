import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold text-amber-400 mb-3">ShopEZ</h3>
            <p className="text-sm leading-relaxed">Your one-stop destination for the best products at unbeatable prices. Shop smart, save big.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <Link to="/products" className="block hover:text-white transition-colors">All Products</Link>
              <Link to="/products?featured=true" className="block hover:text-white transition-colors">Featured</Link>
              <Link to="/cart" className="block hover:text-white transition-colors">Cart</Link>
              <Link to="/orders" className="block hover:text-white transition-colors">Track Order</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Customer Service</h4>
            <div className="space-y-2 text-sm">
              <span className="block">Returns & Refunds</span>
              <span className="block">Shipping Info</span>
              <span className="block">FAQ</span>
              <span className="block">Privacy Policy</span>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Contact</h4>
            <div className="space-y-2 text-sm">
              <span className="flex items-center gap-2"><Mail className="w-4 h-4" />support@shopez.in</span>
              <span className="flex items-center gap-2"><Phone className="w-4 h-4" />1800-SHOPEZ</span>
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4" />Mumbai, India</span>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-8 pt-6 text-center text-sm">&copy; {new Date().getFullYear()} ShopEZ. All rights reserved.</div>
      </div>
    </footer>
  );
}
