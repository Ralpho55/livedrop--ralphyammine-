import type { Meta, StoryObj } from '@storybook/react-vite'

// ProductCard component (inline for stories)
interface ProductCardProps {
  id: number
  title: string
  price: number
  image: string
  stockQty: number
  onAddToCart: (id: number) => void
}

function ProductCard({ id, title, price, image, stockQty, onAddToCart }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow max-w-sm">
      <div className="aspect-square overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-2xl font-bold text-blue-600 mb-4">
          ${price.toFixed(2)}
        </p>
        <div className="flex items-center gap-2 mb-4">
          <span className={`w-2 h-2 rounded-full ${stockQty > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className={`text-sm font-medium ${stockQty > 0 ? 'text-green-700' : 'text-red-700'}`}>
            {stockQty > 0 ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
        <button
          onClick={() => onAddToCart(id)}
          disabled={stockQty === 0}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            stockQty > 0
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {stockQty > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  )
}

const meta = {
  title: 'Components/ProductCard',
  component: ProductCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ProductCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    id: 1,
    title: 'Wireless Bluetooth Headphones',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    stockQty: 25,
    onAddToCart: () => alert('Added!'),
  },
}

export const OutOfStock: Story = {
  args: {
    id: 2,
    title: 'Premium Coffee Maker',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400&h=400&fit=crop',
    stockQty: 0,
    onAddToCart: () => alert('Added!'),
  },
}

