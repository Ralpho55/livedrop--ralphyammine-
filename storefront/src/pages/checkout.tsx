import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../lib/store'
import { placeOrder } from '../lib/api'

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore()
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const navigate = useNavigate()

  const handlePlaceOrder = async () => {
    if (items.length === 0) return
    
    setIsPlacingOrder(true)
    
    try {
      const result = await placeOrder(items)
      clearCart()
      navigate(`/order/${result.orderId}`)
    } catch (error) {
      console.error('Failed to place order:', error)
      setIsPlacingOrder(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Checkout</h1>
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h9.5" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to proceed to checkout!</p>
            <button 
              onClick={() => navigate('/')}
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Checkout</h1>
        <p className="text-lg text-gray-600 mb-8">
          Complete your purchase by providing shipping and payment information.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Checkout Form Placeholder */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter your shipping address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Credit Card</option>
                  <option>PayPal</option>
                  <option>Bank Transfer</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                      <p className="text-gray-500 text-sm">Qty: {item.qty}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">
                    ${(item.price * item.qty).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg mb-6">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${total().toFixed(2)}
                </span>
              </div>
              
              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className={`w-full py-3 px-6 rounded-md font-medium text-lg transition-colors ${
                  isPlacingOrder
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


