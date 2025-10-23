import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listProducts } from '../lib/api'
import { useCartStore } from '../lib/store'

export default function CatalogPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const { addItem } = useCartStore()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await listProducts()
        console.log('Fetched products from API:', data)
        setProducts(data)
      } catch (err) {
        console.error('Error fetching products:', err)
        setError('Failed to load products.')
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const handleAddToCart = (product: any) => {
    addItem(product, 1)
  }

  const filtered = products.filter((p) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      p.title?.toLowerCase().includes(term) ||
      p.name?.toLowerCase().includes(term) ||
      p.tags?.some((t: string) => t.toLowerCase().includes(term))
    )
  })

  const sorted = [...filtered].sort((a, b) =>
    sortOrder === 'asc' ? a.price - b.price : b.price - a.price
  )

  if (loading) return <p className="p-6 text-gray-500">Loading products...</p>
  if (error) return <p className="p-6 text-red-500">{error}</p>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-3xl font-bold mb-4 sm:mb-0">Product Catalog</h1>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="asc">Price: Low → High</option>
              <option value="desc">Price: High → Low</option>
            </select>
            <Link
              to="/cart"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              View Cart
            </Link>
          </div>
        </div>

        {sorted.length === 0 ? (
          <p className="text-gray-500">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sorted.map((product) => (
              <div
                key={product._id || product.id}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition"
              >
                <Link to={`/product/${product._id || product.id}`}>
                  <img
                    src={product.image || '/placeholder.png'}
                    alt={product.title || product.name}
                    className="w-full h-48 object-cover rounded-md mb-3"
                  />
                  <h2 className="font-semibold text-lg truncate">
                    {product.title || product.name}
                  </h2>
                </Link>
                <p className="text-blue-600 font-bold mt-1">
                  ${product.price?.toFixed(2)}
                </p>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="mt-3 w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
