import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../config/api';

const formatDate = (iso) => {
  if (!iso) return '-';
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Bug #28 fix: these statuses now match the Order model enum
// ('created','processing','completed','cancelled')
const getStatusColor = (status) => {
  const statusColors = {
    'created':    '#6366f1',
    'processing': '#3b82f6',
    'completed':  '#10b981',
    'cancelled':  '#ef4444'
  };
  return statusColors[status?.toLowerCase()] || '#6b7280';
};

const getPaymentStatusColor = (status) => {
  const paymentColors = {
    'pending': '#f59e0b',
    'paid': '#10b981',
    'failed': '#ef4444',
    'refunded': '#6b7280'
  };
  return paymentColors[status?.toLowerCase()] || '#6b7280';
};

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.ORDERS, {
        credentials: 'include'
        // headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Orders fetch error', err);
      setError('Unable to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf1] py-10 px-5">
      <div className="text-center mb-10">
        <h1 className="text-[2.5rem] font-bold bg-gradient-to-br from-[#667eea] to-[#764ba2] bg-clip-text text-transparent mb-2.5">📦 My Orders</h1>
      </div>
      <div className="text-center py-16 px-5 text-[1.1rem] text-gray-500 animate-pulse">Loading your orders...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf1] py-10 px-5">
      <div className="text-center mb-10">
        <h1 className="text-[2.5rem] font-bold bg-gradient-to-br from-[#667eea] to-[#764ba2] bg-clip-text text-transparent mb-2.5">📦 My Orders</h1>
      </div>
      <div className="text-center py-16 px-5 text-[1.1rem] text-red-500">{error}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf1] py-10 px-5">
      <div className="text-center mb-10">
        <h1 className="text-[2.5rem] font-bold bg-gradient-to-br from-[#667eea] to-[#764ba2] bg-clip-text text-transparent mb-2.5">📦 My Orders</h1>
        <p className="text-gray-500 text-[1.1rem] m-0">
          Track and manage your orders
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 px-5 bg-white rounded-[20px] max-w-[600px] mx-auto shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
          <div className="text-[5rem] mb-5 opacity-60">📦</div>
          <h2 className="text-[1.8rem] text-gray-800 m-0 mb-2.5 font-bold">No orders yet</h2>
          <p className="text-gray-500 text-[1.1rem] m-0 mb-8">Start shopping to see your orders here!</p>
          <a href="/dashboard" className="inline-block bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white py-[14px] px-8 rounded-lg no-underline font-semibold text-base transition-all duration-300 shadow-[0_4px_15px_rgba(102,126,234,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(102,126,234,0.4)]">
            Start Shopping
          </a>
        </div>
      ) : (
        <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
          {orders.map(order => (
            <div key={order._id} className="bg-white rounded-2xl p-7 shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-0.5">
              
              {/* Order Card Header */}
              <div className="flex flex-col md:flex-row justify-between items-start pb-5 border-b-2 border-gray-100 mb-5 gap-4 md:gap-0">
                <div>
                  <h3 className="text-[1.3rem] font-bold text-gray-800 m-0 mb-1.5">Order #{order._id.slice(-8).toUpperCase()}</h3>
                  <p className="text-gray-500 text-[0.95rem] m-0">Placed on {formatDate(order.createdAt)}</p>
                </div>
                <div className="flex gap-2.5 self-start">
                  <span
                    className="px-4 py-1.5 rounded-full text-[0.85rem] font-semibold text-white capitalize"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status || 'Pending'}
                  </span>
                  <span
                    className="px-4 py-1.5 rounded-full text-[0.85rem] font-semibold text-white capitalize"
                    style={{ backgroundColor: getPaymentStatusColor(order.paymentStatus) }}
                  >
                    {order.paymentStatus || 'Pending'}
                  </span>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 p-4 bg-gray-50 rounded-xl mb-5">
                <div className="flex flex-col gap-1">
                  <span className="text-[0.85rem] text-gray-400 font-medium">Expected Delivery:</span>
                  <span className="text-base text-gray-700 font-semibold">{formatDate(order.deliveryDate)}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[0.85rem] text-gray-400 font-medium">Payment Method:</span>
                  <span className="text-base text-gray-700 font-semibold">{order.paymentMethod || 'N/A'}</span>
                </div>
              </div>

              {/* Order Items */}
              <div className="flex flex-col gap-4 mb-5">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row gap-4 p-4 bg-[#fafafa] rounded-xl transition-all duration-200 hover:bg-gray-100">
                    <div className="shrink-0 w-full md:w-[140px] h-[180px] md:h-[100px] rounded-lg overflow-hidden">
                      <img
                        src={item.car?.images?.[0] || '/placeholder.png'}
                        alt={`${item.car?.brand} ${item.car?.model}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <h4 className="text-[1.1rem] font-bold text-gray-800 m-0">
                        {item.car?.brand} {item.car?.model} ({item.car?.year})
                      </h4>
                      <div className="text-[1.2rem] font-bold text-[#667eea] mt-auto">
                        ₹{item.price.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Card Footer */}
              <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center pt-5 border-t-2 border-gray-100 gap-4 md:gap-0">
                <div className="flex flex-col gap-1">
                  <span className="text-[0.9rem] text-gray-500">Order Total:</span>
                  <span className="text-[1.8rem] font-bold text-gray-800">
                    ₹{(order.total || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <button className="w-full md:w-auto bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none py-3 px-7 rounded-xl font-semibold text-[0.95rem] cursor-pointer transition-all duration-300 shadow-[0_4px_15px_rgba(102,126,234,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(102,126,234,0.4)]">
                  Track Order
                </button>
              </div>
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;