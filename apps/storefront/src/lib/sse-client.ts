export interface OrderStatusMessage {
  status: string;
  updatedAt: string;
  timestamp: string;
}

interface OrderStreamOptions {
  onMessage: (data: OrderStatusMessage) => void;
  onError?: (error: Event) => void;
  onReconnect?: () => void;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
}

export function createOrderStream(
  orderId: string,
  options: OrderStreamOptions
): () => void {
  const {
    onMessage,
    onError,
    onReconnect,
    maxReconnectAttempts = 10,
    reconnectDelay = 3000
  } = options;

  let eventSource: EventSource | null = null;
  let reconnectAttempts = 0;
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  let isClosed = false;

  const connect = () => {
    if (isClosed) return;

    try {
      eventSource = new EventSource(`/api/orders/${orderId}/stream`);
      
      eventSource.onopen = () => {
        console.log(`Order stream connected for order ${orderId}`);
        reconnectAttempts = 0; 
      };

      eventSource.onmessage = (event) => {
        try {
          const data: OrderStatusMessage = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      eventSource.addEventListener('status-update', (event) => {
        try {
          const data: OrderStatusMessage = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error('Error parsing status update:', error);
        }
      });

      eventSource.addEventListener('close', () => {
        console.log('Order stream closed by server');
        cleanup();
      });

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        
        if (onError) {
          onError(error);
        }

        if (!isClosed && reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          console.log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`);
          
          if (onReconnect) {
            onReconnect();
          }

          reconnectTimeout = setTimeout(() => {
            if (!isClosed) {
              connect();
            }
          }, reconnectDelay);
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          console.error('Max reconnection attempts reached');
          cleanup();
        }
      };

    } catch (error) {
      console.error('Error creating EventSource:', error);
      if (onError) {
        onError(error as Event);
      }
    }
  };

  const cleanup = () => {
    isClosed = true;
    
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
    
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };

  connect();

  return cleanup;
}

// Helper function to create a simple order stream
export function createSimpleOrderStream(
  orderId: string,
  onStatusUpdate: (status: string) => void
): () => void {
  return createOrderStream(orderId, {
    onMessage: (data) => {
      onStatusUpdate(data.status);
    },
    onError: (error) => {
      console.error('Order stream error:', error);
    },
    onReconnect: () => {
      console.log('Reconnecting to order stream...');
    }
  });
}
