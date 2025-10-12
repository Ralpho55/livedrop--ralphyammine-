import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProduct, listProducts, type Product } from '../lib/api'
import { useCartStore } from '../lib/store'

export default function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const { addItem } = useCartStore()

  useEffect(() => {
    if (id) {
      getProduct(parseInt(id)).then(product => {
        setProduct(product || null)
        setLoading(false)
        
        // Get related products if product exists
        if (product) {
          listProducts().then(allProducts => {
            const related = allProducts
              .filter(p => p.id !== product.id && p.tags.some(tag => product.tags.includes(tag)))
              .slice(0, 3)
            setRelatedProducts(related)
          })
        }
      })
    }
  }, [id])

  const handleAddToCart = () => {
    if (product) {
      addItem(product, 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Loading product...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600">The product you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            {/* Product Image */}
            <div className="md:w-1/2">
              <div className="aspect-square md:aspect-auto md:h-96">
                <img 
                  src={product.image} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            {/* Product Details */}
            <div className="md:w-1/2 p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.title}
              </h1>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-blue-600">
                  ${product.price.toFixed(2)}
                </span>
              </div>

              {/* Tags */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${product.stockQty > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className={`font-medium ${product.stockQty > 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {product.stockQty > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                  {product.stockQty > 0 && (
                    <span className="text-sm text-gray-500">
                      ({product.stockQty} available)
                    </span>
                  )}
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={product.stockQty === 0}
                className={`w-full py-3 px-6 rounded-md font-medium text-lg transition-colors ${
                  product.stockQty > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {product.stockQty > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  to={`/p/${relatedProduct.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={relatedProduct.image} 
                      alt={relatedProduct.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {relatedProduct.title}
                    </h3>
                    <p className="text-2xl font-bold text-blue-600 mb-2">
                      ${relatedProduct.price.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`w-2 h-2 rounded-full ${relatedProduct.stockQty > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className={`text-sm font-medium ${relatedProduct.stockQty > 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {relatedProduct.stockQty > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {relatedProduct.tags.slice(0, 2).map((tag) => (
                        <span 
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


