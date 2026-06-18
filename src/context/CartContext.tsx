import { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { cartApi, productApi } from '../services/api';
import { useAuth } from './AuthContext';
import type { CartItem } from '../utils/billing';

// ==================== CRITICAL CART FIX ====================
// Uses useReducer + SET_CART action.
// Every cart mutation (POST/PUT/DELETE) dispatches SET_CART with
// the full populated cart array returned from the API response.
// Navbar, CartSidebar, CartPage, CheckoutPage ALL read from
// this single CartContext. No separate local states.

interface CartState {
  items: CartItem[];
  loading: boolean;
}

type CartAction =
  | { type: 'SET_CART'; items: CartItem[] }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'CLEAR_CART' };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_CART':
      console.log('Cart state updated:', action.items.length, 'items');
      return { ...state, items: action.items, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'CLEAR_CART':
      return { items: [], loading: false };
    default:
      return state;
  }
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  itemCount: number;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => void;
  loadCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = 'shopez_guest_cart';

function getGuestCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveGuestCart(items: CartItem[]) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, { items: [], loading: false });

  const loadCart = useCallback(async () => {
    if (!user) {
      const guestItems = getGuestCart();
      dispatch({ type: 'SET_CART', items: guestItems });
      return;
    }
    dispatch({ type: 'SET_LOADING', loading: true });
    try {
      const data = await cartApi.get();
      console.log('Cart API response:', data.items?.length, 'items');
      dispatch({ type: 'SET_CART', items: data.items || [] });
    } catch (err) {
      console.error('Failed to load cart:', err);
      dispatch({ type: 'SET_CART', items: [] });
    }
  }, [user]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Merge guest cart on login
  useEffect(() => {
    if (!user) return;
    const guestItems = getGuestCart();
    if (guestItems.length === 0) return;
    (async () => {
      try {
        for (const item of guestItems) {
          await cartApi.addItem(item.productId, item.quantity);
        }
        localStorage.removeItem(GUEST_CART_KEY);
        loadCart();
      } catch (err) {
        console.error('Failed to merge guest cart:', err);
      }
    })();
  }, [user, loadCart]);

  // ADD TO CART: dispatches SET_CART with API response
  const addToCart = useCallback(async (productId: string, quantity = 1) => {
    if (!user) {
      // Guest: add to local cart
      const items = getGuestCart();
      const existing = items.find(i => i.productId === productId);
      if (existing) {
        existing.quantity += quantity;
        existing.subtotal = existing.quantity * (existing.product.discountPrice || existing.product.price);
      } else {
        const productData = await productApi.getById(productId);
        const product = {
          id: productData.id,
          productName: productData.product_name,
          price: Number(productData.price),
          discountPrice: productData.discount_price ? Number(productData.discount_price) : null,
          images: productData.images || [],
          stock: productData.stock,
          brand: productData.brand,
        };
        items.push({ id: `guest-${Date.now()}`, productId, quantity, product, subtotal: quantity * (product.discountPrice || product.price) });
      }
      saveGuestCart(items);
      dispatch({ type: 'SET_CART', items });
      return;
    }
    try {
      // POST /api/cart returns full populated cart array
      const data = await cartApi.addItem(productId, quantity);
      console.log('Cart API response:', data.items?.length, 'items');
      // Dispatch SET_CART with response.data from backend
      dispatch({ type: 'SET_CART', items: data.items || [] });
    } catch (err) {
      console.error('Failed to add to cart:', err);
      throw err;
    }
  }, [user]);

  // UPDATE QUANTITY: dispatches SET_CART with API response
  const updateQuantity = useCallback(async (cartItemId: string, quantity: number) => {
    if (!user) {
      const items = getGuestCart();
      const item = items.find(i => i.id === cartItemId);
      if (item) {
        item.quantity = quantity;
        item.subtotal = quantity * (item.product.discountPrice || item.product.price);
        saveGuestCart(items);
        dispatch({ type: 'SET_CART', items });
      }
      return;
    }
    try {
      // PUT /api/cart/:id returns full populated cart array
      const data = await cartApi.updateItem(cartItemId, quantity);
      dispatch({ type: 'SET_CART', items: data.items || [] });
    } catch (err) {
      console.error('Failed to update cart:', err);
    }
  }, [user]);

  // REMOVE FROM CART: dispatches SET_CART with API response
  const removeFromCart = useCallback(async (cartItemId: string) => {
    if (!user) {
      const items = getGuestCart().filter(i => i.id !== cartItemId);
      saveGuestCart(items);
      dispatch({ type: 'SET_CART', items });
      return;
    }
    try {
      // DELETE /api/cart/:id returns full populated cart array
      const data = await cartApi.removeItem(cartItemId);
      dispatch({ type: 'SET_CART', items: data.items || [] });
    } catch (err) {
      console.error('Failed to remove from cart:', err);
    }
  }, [user]);

  const clearCart = useCallback(() => {
    localStorage.removeItem(GUEST_CART_KEY);
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items: state.items, loading: state.loading, itemCount, addToCart, updateQuantity, removeFromCart, clearCart, loadCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
