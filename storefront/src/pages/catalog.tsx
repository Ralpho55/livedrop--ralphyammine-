import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listProducts, type Product } from '../lib/api'
import { useCartStore } from '../lib/store'

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const { addItem } = useCartStore()

  useEffect(() => {
    listProducts().then(products => {
      setProducts(products)
      setLoading(false)
    })
  }, [])

  const handleAddToCart = (product: Product) => {
    addItem(product, 1)
  }

  // Get all unique tags from products
  const allTags = Array.from(new Set(products.flatMap(product => product.tags))).sort()

  // Filter products based on search term and selected tag
  const filteredProducts = products.filter(product => {
    // Search filter
    const searchMatch = !searchTerm || (() => {
      const term = searchTerm.toLowerCase()
      const titleMatch = product.title.toLowerCase().includes(term)
      const tagsMatch = product.tags.some(tag => tag.toLowerCase().includes(term))
      return titleMatch || tagsMatch
    })()

    // Tag filter
    const tagMatch = !selectedTag || product.tags.includes(selectedTag)

    return searchMatch && tagMatch
  })

  // Sort filtered products by price
  const filteredAndSorted = [...filteredProducts].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.price - b.price
    } else {
      return b.price - a.price
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Product Catalog</h1>
          <p className="text-lg text-gray-600 mb-8">
            Browse our complete collection of products. Find everything you need in one place.
          </p>
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Loading products...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Product Catalog</h1>
        <p className="text-lg text-gray-600 mb-8">
          Browse our complete collection of products. Find everything you need in one place.
        </p>
        
        {/* Search and Sort Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search Input */}
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search products or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="asc">Price: Low to High</option>
                <option value="desc">Price: High to Low</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* View Cart Button */}
          <Link
            to="/cart"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            View Cart
          </Link>
        </div>

        {/* Tag Filter Buttons */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Category</h3>
          <div className="flex flex-wrap gap-2">
            {/* All Button */}
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedTag === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            
            {/* Tag Buttons */}
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedTag === tag
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        
        {/* Results count */}
        {(searchTerm || selectedTag) && (
          <p className="text-gray-600 mb-6">
            Showing {filteredAndSorted.length} of {products.length} products
            {selectedTag && <span className="ml-1">in "{selectedTag}"</span>}
          </p>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSorted.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.title}
                </h3>
                <p className="text-2xl font-bold text-blue-600 mb-4">
                  ${product.price.toFixed(2)}
                </p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {product.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


