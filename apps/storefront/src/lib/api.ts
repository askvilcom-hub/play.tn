const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

interface FetchOptions extends RequestInit {
  token?: string;
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.error || data.message || 'Erreur serveur',
    );
  }

  return data.data ?? data;
}

// Products
export const productsApi = {
  list: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return fetchApi<{ products: unknown[]; total: number; page: number; totalPages: number }>(
      `/api/products${query}`
    );
  },
  getBySlug: (slug: string) => fetchApi(`/api/products/${slug}`),
  getReviews: (id: string) => fetchApi(`/api/products/${id}/reviews`),
};

// Categories
export const categoriesApi = {
  list: () => fetchApi('/api/categories'),
  getBySlug: (slug: string, params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return fetchApi(`/api/categories/${slug}${query}`);
  },
};

// Cart
export const cartApi = {
  get: (token: string) => fetchApi('/api/cart', { token }),
  addItem: (item: { productId: string; variantId?: string; quantity: number }, token: string) =>
    fetchApi('/api/cart/items', { method: 'POST', body: JSON.stringify(item), token }),
  updateItem: (itemId: string, quantity: number, token: string) =>
    fetchApi(`/api/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
      token,
    }),
  removeItem: (itemId: string, token: string) =>
    fetchApi(`/api/cart/items/${itemId}`, { method: 'DELETE', token }),
};

// Orders
export const ordersApi = {
  create: (data: unknown, token: string) =>
    fetchApi('/api/orders', { method: 'POST', body: JSON.stringify(data), token }),
  list: (token: string) => fetchApi('/api/orders', { token }),
  get: (id: string, token: string) => fetchApi(`/api/orders/${id}`, { token }),
};

// Auth
export const authApi = {
  register: (data: { email: string; firstName: string; lastName: string; phone?: string }, token: string) =>
    fetchApi('/api/auth/register', { method: 'POST', body: JSON.stringify(data), token }),
  getProfile: (token: string) => fetchApi('/api/auth/profile', { token }),
  updateProfile: (data: Record<string, unknown>, token: string) =>
    fetchApi('/api/auth/profile', { method: 'PATCH', body: JSON.stringify(data), token }),
};

// Search
export const searchApi = {
  search: (query: string, params?: Record<string, string>) => {
    const searchParams = new URLSearchParams({ q: query, ...params });
    return fetchApi(`/api/search?${searchParams}`);
  },
};

// Reviews
export const reviewsApi = {
  create: (data: { productId: string; rating: number; title: string; content: string }, token: string) =>
    fetchApi('/api/reviews', { method: 'POST', body: JSON.stringify(data), token }),
};

// Blog
export const blogApi = {
  list: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return fetchApi<{ posts: unknown[]; total: number; page: number; totalPages: number }>(
      `/api/blog${query}`
    );
  },
  getBySlug: (slug: string) => fetchApi(`/api/blog/${slug}`),
  getCategories: () => fetchApi('/api/blog/categories'),
};

export { ApiError };
