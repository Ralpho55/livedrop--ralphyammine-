import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from './api'

interface CartItem extends Product {
  qty: number
}

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, qty?: number) => void
  removeItem: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  clearCart: () => void
  total: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product, qty: number = 1) => {
        const items = get().items
        const productKey = product._id || product.id
        const existing = items.find((i) => (i._id || i.id) === productKey)

        if (existing) {
          set({
            items: items.map((i) =>
              (i._id || i.id) === productKey
                ? { ...i, qty: i.qty + qty }
                : i
            ),
          })
        } else {
          set({ items: [...items, { ...product, qty }] })
        }
      },

      removeItem: (productId: string) => {
        set({
          items: get().items.filter(
            (i) => (i._id || i.id) !== productId
          ),
        })
      },

      updateQty: (productId: string, qty: number) => {
        if (qty <= 0) {
          get().removeItem(productId)
          return
        }

        set({
          items: get().items.map((i) =>
            (i._id || i.id) === productId ? { ...i, qty } : i
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      total: () =>
        get().items.reduce(
          (sum, i) => sum + (i.price || 0) * i.qty,
          0
        ),
    }),
    {
      name: 'shoplite-cart',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          return str ? JSON.parse(str) : null
        },
        setItem: (name, value) =>
          localStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
)
