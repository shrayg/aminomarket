const API = '/api'
import { authHeaders } from './auth'

export type CustomerAddress = {
  id: string
  label: string
  recipientName: string
  line1: string
  line2: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
  isDefault: boolean
}

export type CustomerOrder = {
  id: string
  createdAt: string
  total: number
  currency: string
  paymentStatus: string
  fulfillmentStatus: string
  trackingNumber: string
  items: { name: string; quantity: number; total: number }[]
  shipping: { name: string; address: object } | null
}

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
    me: () => fetchApi('/auth/me', { headers: authHeaders() }),
    requestPasswordReset: (email: string) =>
      fetchApi('/auth/password-reset-request', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
  },
  account: {
    updateProfile: (name: string) =>
      fetchApi('/auth/profile', {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ name }),
      }),
    updatePassword: (data: { currentPassword: string; newPassword: string }) =>
      fetchApi('/auth/password', {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(data),
      }),
    addresses: {
      list: (): Promise<CustomerAddress[]> =>
        fetchApi('/auth/addresses', { headers: authHeaders() }),
      create: (data: Omit<CustomerAddress, 'id'>) =>
        fetchApi('/auth/addresses', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(data),
        }),
      update: (id: string, data: Omit<CustomerAddress, 'id'>) =>
        fetchApi(`/auth/addresses/${id}`, {
          method: 'PATCH',
          headers: authHeaders(),
          body: JSON.stringify(data),
        }),
      remove: (id: string) =>
        fetchApi(`/auth/addresses/${id}`, {
          method: 'DELETE',
          headers: authHeaders(),
        }),
    },
    orders: (): Promise<CustomerOrder[]> =>
      fetchApi('/orders/mine', { headers: authHeaders() }),
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
  checkout: (data: { items: { id: string; quantity: number }[]; email: string; shipping?: object; analyticsSessionId?: string }) =>
    fetchApi('/checkout', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    }),
  trackOrder: (id: string, email: string): Promise<CustomerOrder> =>
    fetchApi(`/orders/track?orderId=${encodeURIComponent(id)}&email=${encodeURIComponent(email)}`),
}
