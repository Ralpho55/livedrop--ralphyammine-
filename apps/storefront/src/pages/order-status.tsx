import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

interface OrderStatus {
  carrier?: string
  eta?: string
  status: string
}

export default function OrderStatusPage() {
  const { id } = useParams<{ id: string }>()
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const url = `${import.meta.env.VITE_API_BASE}/api/orders/${id}/stream`
    const evtSource = new EventSource(url)

    evtSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setOrderStatus(data)
        setLoading(false)
      } catch (e) {
        console.error('Invalid SSE data:', e)
      }
    }

    evtSource.onerror = (err) => {
      console.error('SSE connection error:', err)
      setError('Failed to connect to live updates.')
      evtSource.close()
      setLoading(false)
    }

    return () => evtSource.close()
  }, [id])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'shipped':
      case 'out for delivery':
        return 'bg-blue-100 text-blue-800'
      case 'in transit':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading live order status...</p>
      </div>
    )
  }

  if (error || !orderStatus) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-3xl font-bold mb-4">Order Status</h1>
        <p className="text-red-600 mb-6">
          {error || 'Unable to load order information.'}
        </p>
        <Link
          to="/"
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
        >
          Back to Store
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Order Status</h1>
        <p className="text-gray-600 mb-6">
          Live updates for your order in real-time.
        </p>

        <div className={`p-4 rounded-md ${getStatusColor(orderStatus.status)}`}>
          <h2 className="text-xl font-semibold mb-2">Current Status</h2>
          <p className="text-lg font-medium">{orderStatus.status}</p>
        </div>

        {orderStatus.carrier && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-800">Carrier</h3>
            <p className="text-gray-600">{orderStatus.carrier}</p>
          </div>
        )}

        {orderStatus.eta && (
          <div className="mt-4">
            <h3 className="font-semibold text-gray-800">Estimated Delivery</h3>
            <p className="text-gray-600">{orderStatus.eta}</p>
          </div>
        )}

        <div className="mt-8 text-center border-t pt-6">
          <Link
            to="/"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition"
          >
            Back to Store
          </Link>
        </div>
      </div>
    </div>
  )
}
