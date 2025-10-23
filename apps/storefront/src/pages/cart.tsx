import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../lib/store'

export default function CartPage() {
  const navigate = useNavigate()
  const { items, updateQty, removeItem, total, clearCart } = useCartStore()

  const handleQuantityChange = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      removeItem(productId)
      return
    }
    updateQty(productId, newQty)
  }

  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Shopping Cart</h1>
          <div className="bg-white rounded-lg shadow-md p-12">
            <svg
              className="w-24 h-24 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h9.5"
              />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-6">Add some products to get started!</p>
            <Link
              to="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Shopping Cart</h1>
        <p className="text-lg text-gray-600 mb-8">
          Review your selected items before proceeding to checkout.
        </p>

        {/* Product List */}
        <div className="space-y-4 mb-8">
          {items.map((item) => (
            <div
              key={item._id || item.id}
              className="bg-white rounded-lg shadow-md p-6 flex items-center gap-6"
            >
              {/* Image */}
              <div className="w-20 h-20 flex-shrink-0">
                <img
                  src={item.image || '/placeholder.png'}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {item.name}
                </h3>
                <p className="text-blue-600 font-bold">${item.price.toFixed(2)}</p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuantityChange(item._id || item.id || '', item.qty - 1)}
                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                >
                  -
                </button>
                <input
                  type="number"
                  value={item.qty}
                  onChange={(e) =>
                    handleQuantityChange(item._id || item.id || '', parseInt(e.target.value) || 0)
                  }
                  className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                  min="0"
                />
                <button
                  onClick={() => handleQuantityChange(item._id || item.id || '', item.qty + 1)}
                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                >
                  +
                </button>
              </div>

              {/* Subtotal */}
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  ${(item.price * item.qty).toFixed(2)}
                </p>
              </div>

              {/* Remove */}
              <button
                onClick={() => removeItem(item._id || item.id || '')}
                className="text-red-500 hover:text-red-700 transition p-2"
                title="Remove item"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
            <button
              onClick={clearCart}
              className="text-red-500 hover:text-red-700 text-sm transition"
            >
              Clear Cart
            </button>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between text-lg mb-4">
              <span className="font-semibold">Total:</span>
              <span className="text-2xl font-bold text-blue-600">
                ${total().toFixed(2)}
              </span>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-md hover:bg-gray-300 font-medium"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => navigate('/checkout')}
                className="flex-1 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-medium"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}