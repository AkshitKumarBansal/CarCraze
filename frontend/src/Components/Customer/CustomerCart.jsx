import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import './CustomerCart.css';
import { useToast } from '../../Hooks/useToast';

const CustomerCart = () => {
  const toast = useToast();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkoutStatus, setCheckoutStatus] = useState(null);

  // UPDATED: Now includes the time (e.g., "24 Aug 2026, 10:30 PM")
  const formatDateTime = (iso) => {
    if (!iso) return '';
    const date = new Date(iso);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // UPDATED: Dynamically calculates hours OR days based on the new tier logic
  const calculateDuration = (start, end) => {
    if (!start || !end) return '';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffInMs = endDate.getTime() - startDate.getTime();
    const durationHours = Math.ceil(diffInMs / (1000 * 60 * 60));
    
    if (durationHours < 24) {
      return `${durationHours} Hour${durationHours > 1 ? 's' : ''}`;
    } else {
      const days = Math.ceil(durationHours / 24);
      return `${days} Day${days > 1 ? 's' : ''}`;
    }
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_ENDPOINTS.CART, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch cart');
      const data = await res.json();
      setCart({ items: data.items || [], total: data.total || 0 });
    } catch (err) {
      console.error('Cart fetch error', err);
      setError('Unable to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const removeItem = async (carId) => {
    try {
      const res = await fetch(`${API_ENDPOINTS.CART}/${carId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to remove');
      await fetchCart();
      toast.success('🗑️ Item removed from cart');
    } catch (err) { console.error(err); toast.error('Failed to remove item'); }
  };

  const checkout = async (method = 'online') => {
    try {
      setCheckoutStatus('processing');
      const res = await fetch(API_ENDPOINTS.CART_CHECKOUT, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: method })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Checkout failed');
      setCheckoutStatus('success');
      setCart({ items: [], total: 0 });
      toast.success(`🎉 Order placed successfully! Total: ₹${data.total}`);
      setTimeout(() => {
        toast.info(`📦 Order ID: ${data.orderId}`);
      }, 1500);
    } catch (err) {
      console.error('Checkout error', err);
      setCheckoutStatus('failed');
      toast.error('❌ Checkout failed: ' + (err.message || 'Please try again'));
    }
  };

  if (loading) return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>🛒 Shopping Cart</h1>
      </div>
      <div className="cart-loading">Loading your cart...</div>
    </div>
  );

  if (error) return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>🛒 Shopping Cart</h1>
      </div>
      <div className="cart-error">{error}</div>
    </div>
  );

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>🛒 Shopping Cart</h1>
        <p className="cart-subtitle">
          {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} in your cart
        </p>
      </div>

      {cart.items.length === 0 ? (
        <div className="cart-empty-state">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some amazing cars to get started!</p>
          <a href="/dashboard" className="btn-primary">Browse Cars</a>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items-section">
            {cart.items.map(item => (
              <div key={item.car._id || item.car} className="cart-card">
                <div className="cart-card-image">
                  <img
                    src={item.car.images?.[0] || '/placeholder.png'}
                    alt={`${item.car.brand} ${item.car.model}`}
                  />
                </div>
                <div className="cart-card-details">
                  <h3 className="car-title">
                    {item.car.brand} {item.car.model}
                  </h3>
                  <p className="car-year">Year: {item.car.year}</p>
                  <div className="car-seller">
                    <span className="seller-label">Seller:</span>
                    <span className="seller-name">
                      {item.owner?.firstName || ''} {item.owner?.lastName || ''}
                    </span>
                  </div>
                  <div className="car-contact">
                    <span>📧 {item.owner?.email || 'N/A'}</span>
                  </div>
                </div>

                {/* UPDATED: Rental Information Display */}
                {item.car.listingType === 'rent' && item.startDate && item.endDate && (
                  <div className="cart-card-rental-info" style={{ padding: '0.5rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '0.85rem' }}>
                    <div className="rental-date-item" style={{ marginBottom: '4px' }}>
                      <strong>Pickup:</strong> {formatDateTime(item.startDate)}
                    </div>
                    <div className="rental-date-item" style={{ marginBottom: '4px' }}>
                      <strong>Return:</strong> {formatDateTime(item.endDate)}
                    </div>
                    <div className="rental-duration" style={{ color: '#166534', fontWeight: 'bold' }}>
                      (Duration: {calculateDuration(item.startDate, item.endDate)})
                    </div>
                  </div>
                )}

                <div className="cart-card-actions">
                  <div className="cart-price">₹{item.price.toLocaleString('en-IN')}</div>
                  <button
                    className="btn-remove"
                    onClick={() => removeItem(item.car._id || item.car)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary-section">
            <div className="summary-card">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Subtotal ({cart.items.length} items)</span>
                <span>₹{cart.total.toLocaleString('en-IN')}</span>
              </div>
              <div className="summary-row">
                <span>Taxes</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-total">
                <span>Total</span>
                <span>₹{cart.total.toLocaleString('en-IN')}</span>
              </div>

              <div className="payment-section">
                <h4>Payment Method</h4>
                <button
                  className="payment-btn primary"
                  onClick={() => checkout('online')}
                  disabled={checkoutStatus === 'processing'}
                >
                  💳 Pay Online
                </button>
                <button
                  className="payment-btn"
                  onClick={() => checkout('upi')}
                  disabled={checkoutStatus === 'processing'}
                >
                  📱 UPI Payment
                </button>
                <button
                  className="payment-btn"
                  onClick={() => checkout('cod')}
                  disabled={checkoutStatus === 'processing'}
                >
                  💵 Cash on Delivery
                </button>
              </div>

              {checkoutStatus === 'processing' && (
                <div className="processing-indicator">
                  <div className="spinner"></div>
                  <span>Processing your order...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerCart;