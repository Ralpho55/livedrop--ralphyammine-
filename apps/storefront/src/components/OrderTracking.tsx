import React, { useState, useEffect } from 'react';
import { createOrderStream } from '../lib/sse-client';
import type { OrderStatusMessage } from '../lib/sse-client';

interface OrderTrackingProps {
  orderId: string;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ orderId }) => {
  const [status, setStatus] = useState<string>('');
  const [timestamp, setTimestamp] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!orderId) return;

    const cleanup = createOrderStream(orderId, {
      onMessage: (data: OrderStatusMessage) => {
        setStatus(data.status);
        setTimestamp(data.timestamp);
        setIsConnected(true);
        setError('');
      },
      onError: (error) => {
        console.error('Order stream error:', error);
        setError('Connection error occurred');
        setIsConnected(false);
      },
      onReconnect: () => {
        console.log('Reconnecting to order stream...');
        setIsConnected(false);
        setError('');
      }
    });

    // Cleanup on unmount
    return cleanup;
  }, [orderId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '⏳';
      case 'PROCESSING':
        return '⚙️';
      case 'SHIPPED':
        return '📦';
      case 'DELIVERED':
        return '✅';
      default:
        return '❓';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Order Tracking</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {status && (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getStatusIcon(status)}</span>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Current Status</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(status)}`}>
                  {status}
                </span>
              </div>
            </div>

            {timestamp && (
              <div className="bg-gray-50 rounded-md p-3">
                <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                <p className="text-sm text-gray-700">{formatTimestamp(timestamp)}</p>
              </div>
            )}
          </div>
        )}

        {!status && !error && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Connecting to order stream...</p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Order ID: <span className="font-mono">{orderId}</span>
        </p>
      </div>
    </div>
  );
};

export default OrderTracking;
