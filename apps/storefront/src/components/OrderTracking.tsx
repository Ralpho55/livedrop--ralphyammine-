import { useEffect, useState } from 'react';
import { ShopLiteSSE } from '../lib/sse-client';
import type { SseEvent } from '../lib/sse-client';
import { getOrderStatus } from '../lib/api';

export default function OrderStatus({ orderId }: { orderId: string }) {
  const [status, setStatus] = useState<string>('Loading...');
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    getOrderStatus(orderId).then((res) => setStatus(res.status));

    const sse = new ShopLiteSSE();
    const unsubscribe = sse.subscribe(orderId, (ev: SseEvent) => {
      if (ev.type === 'order_update') {
        setStatus(ev.status);
      }
      if (ev.type === 'heartbeat') {
        setConnected(true);
      }
    });

    return () => unsubscribe();
  }, [orderId]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Order Status</h2>
      <p className="mb-1">Order ID: {orderId}</p>
      <p className="mb-1">
        Status: <span className="font-medium">{status}</span>
      </p>
      <p className="text-xs text-gray-500">
        SSE: {connected ? 'Connected ✅' : 'Connecting…'}
      </p>
    </div>
  );
}
