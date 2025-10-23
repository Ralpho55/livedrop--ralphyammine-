import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProduct } from '../lib/api'
import { useCartStore } from '../lib/store'

export default function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) return
        const data = await getProduct(id)
        setProduct(data)
      } catch (err) {
        console.error('Error fetching product:', err)
        setError('Failed to load product')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  if (loading)
    return <p className="p-6 text-gray-500">Loading product details...</p>

  if (error)
    return (
      <p className="p-6 text-red-500">
        {error}. Please try again or return to the{' '}
        <Link to="/" className="text-blue-600 underline">
          catalog
        </Link>
        .
      </p>
    )

  if (!product)
    return <p className="p-6 text-gray-500">Product not found.</p>

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <img
        src={product.image || '/placeholder.png'}
        alt={product.name}
        className="w-full h-80 object-cover rounded-md"
      />

      <h1 className="mt-6 text-2xl font-bold">{product.name}</h1>
      <p className="text-gray-600 mt-2">{product.description}</p>
      <p className="mt-3 text-xl font-semibold text-indigo-700">
        ${product.price?.toFixed(2)}
      </p>

      <div className="mt-6 flex gap-4">
        <button
          onClick={() => addItem(product, 1)}
          className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
        >
          Add to Cart
        </button>
        <Link
          to="/cart"
          className="flex-1 text-center bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300 transition"
        >
          View Cart
        </Link>
      </div>
    </div>
  )
}
