import { supabase } from '../lib/supabase';

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shop-api`;

async function apiFetch(path: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  const res = await fetch(`${FUNCTION_URL}/${path}`, { ...options, headers });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `API error: ${res.status}`);
  }
  return res.json();
}

export const productApi = {
  getAll: (params?: string) => apiFetch(`products${params ? `?${params}` : ''}`),
  getById: (id: string) => apiFetch(`products/${id}`),
  create: (data: any) => apiFetch('products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiFetch(`products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`products/${id}`, { method: 'DELETE' }),
};

export const cartApi = {
  get: () => apiFetch('cart'),
  addItem: (productId: string, quantity = 1) => apiFetch('cart', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
  updateItem: (id: string, quantity: number) => apiFetch(`cart/${id}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  removeItem: (id: string) => apiFetch(`cart/${id}`, { method: 'DELETE' }),
};

export const orderApi = {
  getAll: () => apiFetch('orders'),
  getById: (id: string) => apiFetch(`orders/${id}`),
  create: (data: any) => apiFetch('orders', { method: 'POST', body: JSON.stringify(data) }),
};

export const categoryApi = {
  getAll: () => apiFetch('categories'),
  create: (data: any) => apiFetch('categories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiFetch(`categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`categories/${id}`, { method: 'DELETE' }),
};

export const bannerApi = {
  getAll: () => apiFetch('banners'),
  create: (data: any) => apiFetch('banners', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiFetch(`banners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`banners/${id}`, { method: 'DELETE' }),
};

export const wishlistApi = {
  getAll: () => apiFetch('wishlist'),
  add: (productId: string) => apiFetch('wishlist', { method: 'POST', body: JSON.stringify({ productId }) }),
  remove: (id: string) => apiFetch(`wishlist/${id}`, { method: 'DELETE' }),
};

export const profileApi = {
  get: () => apiFetch('profile'),
  update: (data: any) => apiFetch('profile', { method: 'PUT', body: JSON.stringify(data) }),
};

export const adminApi = {
  getDashboard: () => apiFetch('admin/dashboard'),
  getUsers: () => apiFetch('admin/users'),
  getOrders: () => apiFetch('admin/orders'),
  updateOrder: (id: string, data: any) => apiFetch(`admin/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};
