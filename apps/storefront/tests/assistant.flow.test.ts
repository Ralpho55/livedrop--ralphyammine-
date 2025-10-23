import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { listProducts, placeOrder, getOrderStatus } from '../src/lib/api';
import { getAssistantResponse } from '../src/assistant/engine.ts';
import { ShopLiteSSE } from '../src/lib/sse-client.ts';

// Mock axios network layer
const mock = new MockAdapter(axios);

describe('ShopLite Assistant End-to-End (Vitest)', () => {
  const API_BASE = 'http://localhost:5000';
  const mockOrderId = 'order123';
  const mockProducts = [{ id: 'p1', title: 'Sneakers', price: 100, qty: 1 }];
  let sse: ShopLiteSSE;

  beforeAll(() => {
    sse = new ShopLiteSSE(API_BASE);
  });

  afterAll(() => {
    sse.close();
    mock.reset();
  });

  it('fetches product list', async () => {
    mock.onGet(`${API_BASE}/api/products`).reply(200, mockProducts);
    const products = await listProducts();
    expect(products[0].title).toBe('Sneakers');
  });

  it('creates an order successfully', async () => {
    mock.onPost(`${API_BASE}/api/orders`).reply(201, { _id: mockOrderId });
    const order = await placeOrder(mockProducts);
    expect(order._id).toBe(mockOrderId);
  });

  it('retrieves order status', async () => {
    mock
      .onGet(`${API_BASE}/api/orders/${mockOrderId}`)
      .reply(200, { status: 'Shipped', updatedAt: Date.now() });
    const res = await getOrderStatus(mockOrderId);
    expect(res.status).toBe('Shipped');
  });

  it('handles assistant query and grounded response', async () => {
    mock
      .onPost(`${API_BASE}/api/assistant`)
      .reply(200, { text: 'Your order is on the way!', intent: 'order_status' });
    const res = await getAssistantResponse('Where is my order?');
    expect(res.response).toMatch(/order/i);
    expect(res.intent).toBe('order_status');
  });

  it('simulates SSE order update', async () => {
    const onEvent = vi.fn();
    const unsubscribe = sse.subscribe(mockOrderId, onEvent);
    // Manually emit a fake message
    sse['source']?.dispatchEvent?.(new MessageEvent('message', {
      data: JSON.stringify({ type: 'order_update', status: 'Delivered' })
    }));
    expect(onEvent).toHaveBeenCalled();
    unsubscribe();
  });
});
