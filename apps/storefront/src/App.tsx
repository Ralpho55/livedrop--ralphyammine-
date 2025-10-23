// src/App.tsx
import { useEffect } from 'react'
import './index.css'
import { listProducts } from './lib/api'
import { useCartStore } from './lib/store'
import AppRouter from './lib/router'
import SupportPanel from './components/assistant/SupportPanel'

function App() {
  console.log("✅ Running from", window.location.href);
  console.log("✅ API base:", import.meta.env.VITE_API_BASE_URL);

  const { items, addItem, total } = useCartStore()
  
  useEffect(() => {
    listProducts().then(products => {
      console.log('Products loaded:', products)
    })
  }, [])
  
  useEffect(() => {
    console.log('Cart changed:', items)
  }, [items])
  
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Storefront Logo" className="h-8" />
          </div>
          <div className="flex items-center gap-4">
            <span>Items: {items.length}</span>
            <span>Total: ${total().toFixed(2)}</span>
          </div>
        </div>
      </div>
      <AppRouter />
      <SupportPanel />
    </div>
  )
}

export default App
