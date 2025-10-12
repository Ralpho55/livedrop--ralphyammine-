import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from './api'

interface CartItem extends Product {
  qty: number
}

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, qty?: number) => void
  removeItem: (productId: number) => void
  updateQty: (productId: number, qty: number) => void
  clearCart: () => void
  total: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product: Product, qty: number = 1) => {
        const items = get().items
        const existingItem = items.find(item => item.id === product.id)
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item.id === product.id
                ? { ...item, qty: item.qty + qty }
                : item
            )
          })
        } else {
          set({
            items: [...items, { ...product, qty }]
          })
        }
      },
      
      removeItem: (productId: number) => {
        set({
          items: get().items.filter(item => item.id !== productId)
        })
      },
      
      updateQty: (productId: number, qty: number) => {
        if (qty <= 0) {
          get().removeItem(productId)
          return
        }
        
        set({
          items: get().items.map(item =>
            item.id === productId ? { ...item, qty } : item
          )
        })
      },
      
      clearCart: () => {
        set({ items: [] })
      },
      
      total: () => {
        return get().items.reduce((sum, item) => sum + (item.price * item.qty), 0)
      }
    }),
    {
      name: 'cart-store',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          return str ? JSON.parse(str) : null
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          localStorage.removeItem(name)
        }
      }
    }
  )
)


