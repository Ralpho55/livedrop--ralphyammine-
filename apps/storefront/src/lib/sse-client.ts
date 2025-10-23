export type SseEvent =
  | { type: 'order_update'; orderId: string; status: string; ts: number }
  | { type: 'heartbeat'; ts: number };

export class ShopLiteSSE {
  private source?: EventSource;
  private reconnectDelay = 2000; 

  private base: string;
  
  constructor(base?: string) {
    this.base = base || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  }

  subscribe(orderId: string, onEvent: (e: SseEvent) => void) {
    const url = `${this.base}/api/orders/${orderId}/stream`;

    const connect = () => {
      this.source = new EventSource(url, { withCredentials: false });

      this.source.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          onEvent(data);
        } catch (_) {}
      };

      this.source.onerror = () => {
        this.close();
        setTimeout(() => connect(), this.reconnectDelay);
      };
    };

    connect();
    return () => this.close();
  }

  close() {
    if (this.source) this.source.close();
    this.source = undefined;
  }
}
