const API_BASE = '/api';

export function getAuthHeaders(): HeadersInit {
  let token = null;
  if (typeof window !== 'undefined') {
    const match = document.cookie.match(new RegExp('(^| )admin_access_token=([^;]+)'));
    if (match) token = match[2];
  }
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let body;
    try {
      body = await res.json();
    } catch (e) {
      const text = await res.text().catch(() => '');
      body = { error: text ? `Server returned ${res.status}: ${text.substring(0, 100)}` : 'Unknown error (not JSON)' };
    }

    // Auto-logout on expired/invalid token
    if (res.status === 401 || res.status === 403) {
      if (typeof window !== 'undefined') {
        document.cookie = 'admin_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'admin_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        window.location.href = '/admin/login';
      }
    }

    throw Object.assign(new Error(body.error || `HTTP ${res.status}`), {
      status: res.status,
    });
  }

  return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  verifyOtp: (email: string, otp: string) =>
    apiFetch<{ accessToken: string; email: string }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }),

  logout: (refreshToken?: string) =>
    apiFetch('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
};

// ── Products ─────────────────────────────────────────────────────────────────
export const productsApi = {
  getAll:   () => apiFetch<{ data: Product[] }>('/products/admin/all'),
  getPublic: (params?: string) => apiFetch<{ data: Product[] }>(`/products${params ? '?' + params : ''}`),
  create:   (body: Partial<Product>) => apiFetch<{ data: Product }>('/products', { method: 'POST', body: JSON.stringify(body) }),
  update:   (id: number, body: Partial<Product>) => apiFetch<{ data: Product }>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete:   (id: number) => apiFetch(`/products/${id}`, { method: 'DELETE' }),
};

// ── Product Sizes ─────────────────────────────────────────────────────────────
export const productSizesApi = {
  getByProduct:      (productId: number) => apiFetch<{ data: ProductSize[] }>(`/product-sizes/${productId}/admin`),
  getPublicByProduct:(productId: number) => apiFetch<{ data: ProductSize[] }>(`/product-sizes/${productId}`),
  create:            (productId: number, body: Partial<ProductSize>) => apiFetch<{ data: ProductSize }>(`/product-sizes/${productId}`, { method: 'POST', body: JSON.stringify(body) }),
  update:            (productId: number, sizeId: number, body: Partial<ProductSize>) => apiFetch<{ data: ProductSize }>(`/product-sizes/${productId}/${sizeId}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete:            (productId: number, sizeId: number) => apiFetch(`/product-sizes/${productId}/${sizeId}`, { method: 'DELETE' }),
  bulkReplace:       (productId: number, sizes: Partial<ProductSize>[]) => apiFetch<{ data: ProductSize[] }>(`/product-sizes/${productId}/bulk`, { method: 'POST', body: JSON.stringify({ sizes }) }),
};

// ── Categories ────────────────────────────────────────────────────────────────
export const categoriesApi = {
  getAll:   () => apiFetch<{ data: Category[] }>('/categories/admin/all'),
  getPublic: () => apiFetch<{ data: Category[] }>('/categories'),
  create:   (body: Partial<Category>) => apiFetch<{ data: Category }>('/categories', { method: 'POST', body: JSON.stringify(body) }),
  update:   (id: number, body: Partial<Category>) => apiFetch<{ data: Category }>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete:   (id: number) => apiFetch(`/categories/${id}`, { method: 'DELETE' }),
};

// ── Offers ────────────────────────────────────────────────────────────────────
export const offersApi = {
  getAll:    () => apiFetch<{ data: Offer[] }>('/offers/admin/all'),
  getPublic: () => apiFetch<{ data: Offer[] }>('/offers'),
  create:    (body: Partial<Offer>) => apiFetch<{ data: Offer }>('/offers', { method: 'POST', body: JSON.stringify(body) }),
  update:    (id: number, body: Partial<Offer>) => apiFetch<{ data: Offer }>(`/offers/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete:    (id: number) => apiFetch(`/offers/${id}`, { method: 'DELETE' }),
};

// ── Daily Picks ───────────────────────────────────────────────────────────────
export const dailyPicksApi = {
  getAll:    () => apiFetch<{ data: DailyPick[] }>('/daily-picks/admin/all'),
  getPublic: () => apiFetch<{ data: DailyPick[] }>('/daily-picks'),
  create:    (body: Partial<DailyPick>) => apiFetch<{ data: DailyPick }>('/daily-picks', { method: 'POST', body: JSON.stringify(body) }),
  update:    (id: number, body: Partial<DailyPick>) => apiFetch<{ data: DailyPick }>(`/daily-picks/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete:    (id: number) => apiFetch(`/daily-picks/${id}`, { method: 'DELETE' }),
};

// ── Hero Slides ───────────────────────────────────────────────────────────────
export const heroSlidesApi = {
  getAll:    () => apiFetch<{ data: HeroSlide[] }>('/hero-slides/admin/all'),
  getPublic: () => apiFetch<{ data: HeroSlide[] }>('/hero-slides'),
  create:    (body: Partial<HeroSlide>) => apiFetch<{ data: HeroSlide }>('/hero-slides', { method: 'POST', body: JSON.stringify(body) }),
  update:    (id: number, body: Partial<HeroSlide>) => apiFetch<{ data: HeroSlide }>(`/hero-slides/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete:    (id: number) => apiFetch(`/hero-slides/${id}`, { method: 'DELETE' }),
};

// ── Reviews ───────────────────────────────────────────────────────────────────
export const reviewsApi = {
  getAll:    () => apiFetch<{ data: Review[] }>('/reviews/admin/all'),
  getPublic: () => apiFetch<{ data: Review[] }>('/reviews'),
  create:    (body: Partial<Review>) => apiFetch<{ data: Review }>('/reviews', { method: 'POST', body: JSON.stringify(body) }),
  update:    (id: number, body: Partial<Review>) => apiFetch<{ data: Review }>(`/reviews/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete:    (id: number) => apiFetch(`/reviews/${id}`, { method: 'DELETE' }),
};

// ── Contact ───────────────────────────────────────────────────────────────────
export const contactApi = {
  getAdminAll: () => apiFetch<{ data: Contact[] }>('/contact/admin/all'),
  getPublic:   () => apiFetch<{ data: Contact[] }>('/contact'),
  create:      (body: Partial<Contact>) => apiFetch<{ data: Contact }>('/contact/admin', { method: 'POST', body: JSON.stringify(body) }),
  update:      (id: number, body: Partial<Contact>) => apiFetch<{ data: Contact }>(`/contact/admin/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete:      (id: number) => apiFetch(`/contact/admin/${id}`, { method: 'DELETE' }),
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const ordersApi = {
  create:      (body: { table_number: string, total_amount: number, items: any[] }) => apiFetch<{ data: Order }>('/orders', { method: 'POST', body: JSON.stringify(body) }),
  getAdminAll: () => apiFetch<{ data: Order[] }>('/orders/admin/all'),
  updateStatus:(id: number, status: string) => apiFetch<{ data: Order }>(`/orders/admin/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  delete:      (id: number) => apiFetch(`/orders/admin/${id}`, { method: 'DELETE' }),
};

// ── Home ──────────────────────────────────────────────────────────────────────
export const homeApi = {
  getPublic: () => apiFetch<{ data: any }>('/home'),
};

// ── Upload ────────────────────────────────────────────────────────────────────
export async function uploadImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('image', file);
  let token = null;
  if (typeof window !== 'undefined') {
    const match = document.cookie.match(new RegExp('(^| )admin_access_token=([^;]+)'));
    if (match) token = match[2];
  }
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    const b = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(b.error);
  }
  return res.json();
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Product {
  id: number;
  name_ar: string;
  name_en: string | null;
  name_tr: string | null;
  price: number;
  category_id: number | null;
  category_name?: string;
  image_url: string | null;
  ingredients: string | null;
  ingredients_tr: string | null;
  badge: string | null;
  badge_tr: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductSize {
  id: number;
  product_id: number;
  name_ar: string;
  name_tr: string | null;
  price: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name_ar: string;
  name_tr: string | null;
  icon: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Offer {
  id: number;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface DailyPick {
  id: number;
  title: string;
  title_tr: string | null;
  subtitle: string | null;
  subtitle_tr: string | null;
  price: string | null;
  emoji: string | null;
  is_active: boolean;
}

export interface HeroSlide {
  id: number;
  image_url: string;
  title: string;
  title_tr: string | null;
  subtitle: string | null;
  subtitle_tr: string | null;
  is_active: boolean;
}

export interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
  comment_tr: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Contact {
  id: number;
  type: string;
  title_ar: string;
  title_tr: string | null;
  detail: string;
  detail_tr: string | null;
  icon: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number | null;
  product_name: string;
  price: number;
  quantity: number;
  options: any;
  created_at: string;
}

export interface Order {
  id: number;
  table_number: string;
  total_amount: number;
  status: string;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}
