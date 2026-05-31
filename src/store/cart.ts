import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  id: string
  productId: string
  name: string
  slug: string
  price: number
  quantity: number
  image?: string
  variantLabel?: string
}

type CartStore = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, qty: number) => void
  clearCart: () => void
  getTotal: () => number
  getCount: () => number
}

const normalizeQuantity = (qty: number) =>
  Math.min(99, Math.max(1, Number.isFinite(qty) ? Math.floor(qty) : 1))

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, qty = 1) => {
        const quantity = normalizeQuantity(qty)
        set((s) => {
          const existing = s.items.find((i) => i.id === item.id)
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: normalizeQuantity(i.quantity + quantity) }
                  : i
              ),
            }
          }
          return { items: [...s.items, { ...item, quantity }] }
        })
      },
      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      updateQuantity: (id, qty) => {
        if (qty <= 0) return get().removeItem(id)
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id ? { ...i, quantity: normalizeQuantity(qty) } : i
          ),
        }))
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'amp-cart-v2' }
  )
)
