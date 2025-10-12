import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// ProductCard component (inline for testing)
interface ProductCardProps {
  id: number
  title: string
  price: number
  image: string
  onAddToCart: (id: number) => void
}

function ProductCard({ id, title, price, image, onAddToCart }: ProductCardProps) {
  return (
    <div className="product-card">
      <img src={image} alt={title} />
      <h3>{title}</h3>
      <p>${price.toFixed(2)}</p>
      <button onClick={() => onAddToCart(id)}>Add to Cart</button>
    </div>
  )
}

describe('ProductCard', () => {
  const mockProduct = {
    id: 1,
    title: 'Wireless Bluetooth Headphones',
    price: 89.99,
    image: 'https://example.com/headphones.jpg'
  }

  it('renders product title and price', () => {
    const mockHandler = vi.fn()
    
    render(
      <ProductCard
        id={mockProduct.id}
        title={mockProduct.title}
        price={mockProduct.price}
        image={mockProduct.image}
        onAddToCart={mockHandler}
      />
    )

    // Check that title appears in the document
    expect(screen.getByText('Wireless Bluetooth Headphones')).toBeTruthy()
    
    // Check that price appears in the document
    expect(screen.getByText('$89.99')).toBeTruthy()
  })

  it('calls handler when Add to Cart button is clicked', () => {
    const mockHandler = vi.fn()
    
    render(
      <ProductCard
        id={mockProduct.id}
        title={mockProduct.title}
        price={mockProduct.price}
        image={mockProduct.image}
        onAddToCart={mockHandler}
      />
    )

    // Find and click the Add to Cart button
    const addToCartButton = screen.getByText('Add to Cart')
    fireEvent.click(addToCartButton)

    // Assert that handler was called
    expect(mockHandler).toHaveBeenCalledTimes(1)
    expect(mockHandler).toHaveBeenCalledWith(mockProduct.id)
  })

  it('renders product image with alt attribute', () => {
    const mockHandler = vi.fn()
    
    render(
      <ProductCard
        id={mockProduct.id}
        title={mockProduct.title}
        price={mockProduct.price}
        image={mockProduct.image}
        onAddToCart={mockHandler}
      />
    )

    // Find the image element
    const image = screen.getByAltText('Wireless Bluetooth Headphones')
    
    // Verify image exists and has correct attributes
    expect(image).toBeTruthy()
    expect(image.getAttribute('src')).toBe(mockProduct.image)
    expect(image.getAttribute('alt')).toBe(mockProduct.title)
  })

  it('formats price with two decimal places', () => {
    const mockHandler = vi.fn()
    
    render(
      <ProductCard
        id={2}
        title="Test Product"
        price={19.5}
        image="test.jpg"
        onAddToCart={mockHandler}
      />
    )

    // Check that price is formatted correctly
    expect(screen.getByText('$19.50')).toBeTruthy()
  })

  it('renders all elements correctly', () => {
    const mockHandler = vi.fn()
    
    render(
      <ProductCard
        id={mockProduct.id}
        title={mockProduct.title}
        price={mockProduct.price}
        image={mockProduct.image}
        onAddToCart={mockHandler}
      />
    )

    // Verify all elements are present
    expect(screen.getByRole('img')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 3 })).toBeTruthy()
    expect(screen.getByRole('button')).toBeTruthy()
  })
})

