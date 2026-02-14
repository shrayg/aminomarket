const API = '/api'

export async function fetchApi(path: string, opts?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...opts?.headers,
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const api = {
  products: {
    list: (category?: string) =>
      fetchApi(category ? `/products?category=${category}` : '/products'),
    get: (slug: string) => fetchApi(`/products/${slug}`),
  },
  auth: {
    login: (email: string, password: string) =>
      fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (email: string, password: string, name?: string) =>
      fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      }),
  },
  newsletter: (email: string) =>
    fetchApi('/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  contact: (data: { name?: string; email: string; message: string; orderNumber?: string }) =>
    fetchApi('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  checkout: (data: { items: { id: string; name: string; price: number; quantity: number }[]; email: string; shipping?: object }) =>
    fetchApi('/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  order: (id: string) => fetchApi(`/orders/${id}`),
}
