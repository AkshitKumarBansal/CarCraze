import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import './CustomerOrders.css';

const formatDate = (iso) => {
  if (!iso) return '-';
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getStatusColor = (status) => {
  const statusColors = {
    'pending': '#f59e0b',
    'processing': '#3b82f6',
    'confirmed': '#8b5cf6',
    'shipped': '#06b6d4',
    'delivered': '#10b981',
    'cancelled': '#ef4444'
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
      const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.ORDERS, {
        headers: { Authorization: `Bearer ${token}` }
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
    <div className="orders-page">
      <div className="orders-header">
        <h1>📦 My Orders</h1>
      </div>
      <div className="orders-loading">Loading your orders...</div>
    </div>
  );

  if (error) return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>📦 My Orders</h1>
      </div>
      <div className="orders-error">{error}</div>
    </div>
  );

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>📦 My Orders</h1>
        <p className="orders-subtitle">
          Track and manage your orders
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="orders-empty-state">
          <div className="empty-orders-icon">📦</div>
          <h2>No orders yet</h2>
          <p>Start shopping to see your orders here!</p>
          <a href="/dashboard" className="btn-primary">Start Shopping</a>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-card-header">
                <div className="order-info">
                  <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
                  <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
                </div>
                <div className="order-status-badges">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status || 'Pending'}
                  </span>
                  <span
                    className="payment-badge"
                    style={{ backgroundColor: getPaymentStatusColor(order.paymentStatus) }}
                  >
                    {order.paymentStatus || 'Pending'}
                  </span>
                </div>
              </div>

              <div className="order-delivery-info">
                <div className="delivery-item">
                  <span className="delivery-label">Expected Delivery:</span>
                  <span className="delivery-value">{formatDate(order.deliveryDate)}</span>
                </div>
                <div className="delivery-item">
                  <span className="delivery-label">Payment Method:</span>
                  <span className="delivery-value">{order.paymentMethod || 'N/A'}</span>
                </div>
              </div>

              <div className="order-items">
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item">
                    <div className="order-item-image">
                      <img
                        src={item.car?.images?.[0] || '/placeholder.png'}
                        alt={`${item.car?.brand} ${item.car?.model}`}
                      />
                    </div>
                    <div className="order-item-details">
                      <h4>{item.car?.brand} {item.car?.model} ({item.car?.year})</h4>
                      <div className="seller-info">
                        <span className="seller-icon">👤</span>
                        <span className="seller-text">
                          Seller: <strong>
                            {item.owner?.firstName || ''} {item.owner?.lastName || 'Unknown Seller'}
                          </strong>
                        </span>
                      </div>
                      <div className="item-price">₹{item.price.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-card-footer">
                <div className="order-total">
                  <span>Order Total:</span>
                  <span className="total-amount">
                    ₹{order.items.reduce((sum, item) => sum + (item.price || 0), 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <button className="btn-track">Track Order</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
