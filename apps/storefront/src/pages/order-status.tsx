import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getOrderStatus } from '../lib/api'

interface OrderStatus {
  carrier: string
  eta: string
  status: string
}

export default function OrderStatusPage() {
  const { id } = useParams<{ id: string }>()
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      getOrderStatus(id)
        .then(status => {
          setOrderStatus(status)
          setLoading(false)
        })
        .catch(err => {
          setError('Failed to load order status')
          setLoading(false)
          console.error('Error fetching order status:', err)
        })
    }
  }, [id])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'out for delivery':
        return 'bg-blue-100 text-blue-800'
      case 'in transit':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const shouldShowShippingDetails = (status: string) => {
    const lowercaseStatus = status.toLowerCase()
    return lowercaseStatus === 'shipped' || lowercaseStatus === 'delivered'
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'out for delivery':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
      case 'in transit':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        )
      case 'shipped':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Order Status</h1>
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading order status...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !orderStatus) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Order Status</h1>
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-red-400 mb-4">
              <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-6">
              {error || 'We couldn\'t find information about this order.'}
            </p>
            <Link 
              to="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Back to Store
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Order Status</h1>
        <p className="text-lg text-gray-600 mb-8">
          Track your order and view shipping updates in real-time.
        </p>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Order ID */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Order ID</h2>
            <p className="text-blue-600 font-mono text-lg">{id}</p>
          </div>

          {/* Status Card */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-full ${getStatusColor(orderStatus.status)}`}>
                {getStatusIcon(orderStatus.status)}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Current Status</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orderStatus.status)}`}>
                  {orderStatus.status}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Details - Only show for Shipped or Delivered */}
          {shouldShowShippingDetails(orderStatus.status) && (
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className={`rounded-lg p-4 ${
                orderStatus.status.toLowerCase() === 'delivered' 
                  ? 'bg-green-50' 
                  : 'bg-blue-50'
              }`}>
                <h4 className={`font-semibold mb-2 ${
                  orderStatus.status.toLowerCase() === 'delivered' 
                    ? 'text-green-900' 
                    : 'text-blue-900'
                }`}>
                  Carrier
                </h4>
                <p className={`text-lg ${
                  orderStatus.status.toLowerCase() === 'delivered' 
                    ? 'text-green-700' 
                    : 'text-blue-700'
                }`}>
                  {orderStatus.carrier}
                </p>
              </div>
              <div className={`rounded-lg p-4 ${
                orderStatus.status.toLowerCase() === 'delivered' 
                  ? 'bg-green-50' 
                  : 'bg-blue-50'
              }`}>
                <h4 className={`font-semibold mb-2 ${
                  orderStatus.status.toLowerCase() === 'delivered' 
                    ? 'text-green-900' 
                    : 'text-blue-900'
                }`}>
                  {orderStatus.status.toLowerCase() === 'delivered' ? 'Delivered On' : 'Estimated Delivery'}
                </h4>
                <p className={`text-lg ${
                  orderStatus.status.toLowerCase() === 'delivered' 
                    ? 'text-green-700' 
                    : 'text-blue-700'
                }`}>
                  {orderStatus.eta}
                </p>
              </div>
            </div>
          )}

          {/* Back to Store Button */}
          <div className="text-center pt-6 border-t">
            <Link 
              to="/"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Back to Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


