import axios from 'axios'

export interface Product {
  _id?: string
  id?: string
  name: string
  title?: string
  price: number
  image?: string
  description?: string
  tags?: string[]
}

const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || 'http://localhost:5000'

/**
 * 🛒 Fetch all products
 */
export async function listProducts(params?: {
  search?: string
  tag?: string
  sort?: string
  page?: number
  limit?: number
}) {
  const { data } = await axios.get(`${API_BASE}/api/products`, { params })
  return data
}

/**
 * 🧾 Fetch a single product by ID
 */
export async function getProduct(id: string) {
  const { data } = await axios.get(`${API_BASE}/api/products/${id}`)
  return data
}

/**
 * 🛍️ Place a new order
 */
export async function placeOrder(items: any[], customerId?: string) {
  const payload = {
    customerId: customerId || 'guest',
    items: items.map((i) => ({
      productId: i._id || i.id,
      name: i.name || i.title,
      price: i.price,
      quantity: i.qty,
    })),
  }

  const { data } = await axios.post(`${API_BASE}/api/orders`, payload)
  return data // includes _id for redirect
}

/**
 * 🚚 Fetch order status (non-SSE fallback)
 */
export async function getOrderStatus(id: string) {
  const { data } = await axios.get(`${API_BASE}/api/orders/${id}`)
  return {
    status: data.status,
    carrier: data.carrier ?? 'Pending assignment',
    eta:
      data.estimatedDelivery ??
      new Date(data.updatedAt).toLocaleDateString(),
  }
}

/**
 * 📊 Fetch analytics metrics
 */
export async function getAnalytics() {
  const { data } = await axios.get(`${API_BASE}/api/analytics/metrics`)
  return data
}
