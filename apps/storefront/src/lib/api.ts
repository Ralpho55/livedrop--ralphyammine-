export interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  tags: string[];
  stockQty: number;
  description: string;
}

export async function listProducts(): Promise<Product[]> {
  const response = await fetch('/mock-catalog.json');
  const products = await response.json();
  return products;
}

export async function getProduct(id: number): Promise<Product | undefined> {
  const products = await listProducts();
  return products.find(product => product.id === id);
}

export async function placeOrder(cart: any): Promise<{ orderId: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  return { orderId };
}

export async function getOrderStatus(id: string): Promise<{ carrier: string; eta: string; status: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const carriers = ['UPS', 'FedEx', 'USPS', 'DHL'];
  const statuses = ['Processing', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered'];
  
  const carrier = carriers[Math.floor(Math.random() * carriers.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  
  // Generate random ETA (1-7 days from now)
  const eta = new Date();
  eta.setDate(eta.getDate() + Math.floor(Math.random() * 7) + 1);
  
  return {
    carrier,
    eta: eta.toLocaleDateString(),
    status
  };
}


