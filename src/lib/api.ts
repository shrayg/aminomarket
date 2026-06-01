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

export type ShippingRateOption = {
  serviceKey: string
  carrier: 'USPS' | 'UPS'
  service: string
  displayName: string
  amountCents: number
  estimatedDays: string
}

export type ShippingQuoteRequestAddress = {
  line1?: string
  line2?: string
  city: string
  state?: string
  zip?: string
  country: string
  isPoBox?: boolean
}

export type ShippingQuoteResponse = {
  rates: ShippingRateOption[]
  parcelWeightGrams: number
  zoneId: string
  subtotalCents: number
}

export type CheckoutShippingPayload = {
  recipientName: string
  line1: string
  line2?: string
  city: string
  state: string
  zip: string
  country: string
  isPoBox?: boolean
}

export type CheckoutSelectedRate = {
  carrier: string
  service: string
  displayName: string
  amountCents: number
}

export type CheckoutMarketingOptIn = {
  email: boolean
  sms: boolean
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

export type LoyaltyStatus = {
  lifetimeSpendCents: number
  thresholdCents: number
  percentToThreshold: number
  unlocked: boolean
  discountPercent: number
}

export type AffiliateRole = 'customer' | 'affiliate' | 'admin'
export type AffiliateStatus = 'none' | 'pending' | 'approved' | 'denied'

export type AffiliateOverview =
  | { status: 'none'; role: AffiliateRole }
  | {
      status: 'pending' | 'denied'
      role: AffiliateRole
      code?: string | null
    }
  | {
      status: 'approved'
      role: 'affiliate'
      code: string
      totalUses: number
      totalProcessedCents: number
      totalShippingCents: number
      totalTotalCents: number
      commissionRatePercent: number
      estimatedCommissionCents: number
      estimatedCommissionDollars: number
      tierProgress: {
        ordersToNextTier: number
        dollarsToNextTier: number
      }
    }

export type AdminUserRow = {
  id: string
  email: string
  name: string
  role: AffiliateRole
  affiliateStatus: AffiliateStatus
  affiliateCode: string | null
  lifetimeSpendCents: number
  createdAt: string
}

export type AdminUserListResponse = {
  users: AdminUserRow[]
  total: number | null
  limit: number
  offset: number
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
    login: (identifier: string, password: string) =>
      fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      }),
    register: (data: {
      email: string
      password: string
      name?: string
      marketingEmailOptIn?: boolean
      marketingSmsOptIn?: boolean
      phone?: string
    }) =>
      fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
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
    loyalty: (): Promise<LoyaltyStatus> =>
      fetchApi('/account/loyalty', { headers: authHeaders() }),
  },
  affiliate: {
    getOverview: (): Promise<AffiliateOverview> =>
      fetchApi('/account/affiliate', { headers: authHeaders() }),
    apply: (data: { reason: string; audience: string }) =>
      fetchApi('/account/affiliate/apply', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      }),
    requestPayout: (data: { payoutMethod: string }) =>
      fetchApi('/account/affiliate/payout-request', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      }),
  },
  admin: {
    listUsers: (
      params: { status?: AffiliateStatus; role?: AffiliateRole; limit?: number; offset?: number },
      authToken: string
    ): Promise<AdminUserListResponse> => {
      const search = new URLSearchParams()
      if (params.status) search.set('status', params.status)
      if (params.role) search.set('role', params.role)
      if (params.limit != null) search.set('limit', String(params.limit))
      if (params.offset != null) search.set('offset', String(params.offset))
      const qs = search.toString()
      return fetchApi(`/admin/users${qs ? `?${qs}` : ''}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
    },
    approveAffiliate: (userId: string, authToken: string): Promise<{ user: AdminUserRow }> =>
      fetchApi(`/admin/users/${encodeURIComponent(userId)}/affiliate/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      }),
    denyAffiliate: (userId: string, authToken: string): Promise<{ user: AdminUserRow }> =>
      fetchApi(`/admin/users/${encodeURIComponent(userId)}/affiliate/deny`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
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
  checkout: (data: {
    items: { id: string; quantity: number }[]
    email: string
    shipping: CheckoutShippingPayload
    selectedRate: CheckoutSelectedRate
    ruoAcknowledged: boolean
    marketingOptIn?: CheckoutMarketingOptIn
    analyticsSessionId?: string
  }) =>
    fetchApi('/checkout', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    }),
  quoteShipping: (data: {
    items: { id: string; quantity: number; weightGrams?: number }[]
    address: ShippingQuoteRequestAddress
  }): Promise<ShippingQuoteResponse> =>
    fetchApi('/checkout/quote', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    }),
  trackOrder: (id: string, email: string): Promise<CustomerOrder> =>
    fetchApi(`/orders/track?orderId=${encodeURIComponent(id)}&email=${encodeURIComponent(email)}`),
}
