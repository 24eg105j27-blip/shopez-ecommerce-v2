import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { wishlistApi } from '../services/api';
import { useAuth } from './AuthContext';

interface WishlistItem {
  id: string;
  productId: string;
  product: { id: string; productName: string; price: number; discountPrice: number | null; images: string[]; stock: number; brand: string; rating: number };
}

interface WishlistContextType {
  items: WishlistItem[];
  loading: boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (id: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadWishlist = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    try { const data = await wishlistApi.getAll(); setItems(data.items || []); }
    catch { setItems([]); } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { loadWishlist(); }, [loadWishlist]);

  const addToWishlist = useCallback(async (productId: string) => {
    try { await wishlistApi.add(productId); await loadWishlist(); }
    catch (err) { console.error('Wishlist add failed:', err); }
  }, [loadWishlist]);

  const removeFromWishlist = useCallback(async (id: string) => {
    try { await wishlistApi.remove(id); await loadWishlist(); }
    catch (err) { console.error('Wishlist remove failed:', err); }
  }, [loadWishlist]);

  const isInWishlist = useCallback((productId: string) => items.some(i => i.productId === productId), [items]);

  return (
    <WishlistContext.Provider value={{ items, loading, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
}
