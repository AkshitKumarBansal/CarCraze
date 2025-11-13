import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import './CustomerCart.css';

const CustomerCart = () => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkoutStatus, setCheckoutStatus] = useState(null);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.CART, {
        headers: { Authorization: `Bearer ${token}` }
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
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_ENDPOINTS.CART}/${carId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to remove');
      await fetchCart();
    } catch (err) { console.error(err); alert('Remove failed'); }
  };

  const checkout = async (method = 'online') => {
    try {
      setCheckoutStatus('processing');
      const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.CART_CHECKOUT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ paymentMethod: method })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Checkout failed');
      setCheckoutStatus('success');
      setCart({ items: [], total: 0 });
      alert(`Checkout successful. Order: ${data.orderId} Total: ₹${data.total}`);
    } catch (err) {
      console.error('Checkout error', err);
      setCheckoutStatus('failed');
      alert('Checkout failed: ' + (err.message || ''));
    }
  };

  if (loading) return <div className="cart-container">Loading cart...</div>;
  if (error) return <div className="cart-container">{error}</div>;

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      {cart.items.length === 0 ? (
        <div className="cart-empty">Your cart is empty.</div>
      ) : (
        <div>
          <ul className="cart-list">
            {cart.items.map(it => (
              <li key={it.car._id || it.car} className="cart-item">
                <div className="cart-item-main">
                  <img src={it.car.images?.[0] || '/placeholder.png'} alt="car" className="cart-thumb" />
                  <div>
                    <div className="cart-item-title">{it.car.brand} {it.car.model} ({it.car.year})</div>
                    <div className="cart-item-owner">Owner: {it.owner?.firstName || ''} {it.owner?.lastName || ''} — {it.owner?.email || ''}</div>
                    <div className="cart-item-price">Price: ₹{it.price}</div>
                  </div>
                </div>
                <div className="cart-item-actions">
                  <button onClick={() => removeItem(it.car._id || it.car)}>Remove</button>
                </div>
              </li>
            ))}
          </ul>

          <div className="cart-summary">
            <div>Total: <strong>₹{cart.total}</strong></div>
            <div className="payment-options">
              <button onClick={() => checkout('online')}>Pay Online</button>
              <button onClick={() => checkout('upi')}>Pay via UPI</button>
              <button onClick={() => checkout('cod')}>Cash on Delivery</button>
            </div>
            {checkoutStatus === 'processing' && <div>Processing payment...</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerCart;
