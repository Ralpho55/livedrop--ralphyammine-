import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../lib/store'
import { placeOrder } from '../lib/api'

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore()
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handlePlaceOrder = async () => {
    if (items.length === 0) return

    setIsPlacingOrder(true)
    setError(null)

    try {
      const order = await placeOrder(items)
      clearCart()
      navigate(`/order-status/${order._id}`)
    } catch (err) {
      console.error('Order placement failed:', err)
      setError('Failed to place order. Please try again.')
      setIsPlacingOrder(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Checkout</h1>
        <p className="text-gray-600 mb-6">Your cart is empty.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
        >
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        <p className="text-gray-600 mb-8">
          Review your order before finalizing your purchase.
        </p>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-3 mb-6">
            {items.map((item) => (
              <div
                key={item._id || item.id}
                className="flex justify-between items-center border-b pb-2"
              >
                <div>
                  <p className="font-medium">{item.title || item.name}</p>
                  <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                </div>
                <p className="font-semibold text-gray-800">
                  ${(item.price * item.qty).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-lg font-semibold mb-4">
            <span>Total:</span>
            <span className="text-blue-600">${total().toFixed(2)}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder}
            className={`w-full py-3 rounded-md font-medium text-white transition ${
              isPlacingOrder
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  )
}
