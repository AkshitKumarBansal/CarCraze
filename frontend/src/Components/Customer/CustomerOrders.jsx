import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import './CustomerCart.css';

const formatDate = (iso) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString();
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

  if (loading) return <div className="cart-container">Loading orders...</div>;
  if (error) return <div className="cart-container">{error}</div>;

  return (
    <div className="cart-container">
      <h2>Your Orders</h2>
      {orders.length === 0 ? (
        <div className="cart-empty">You have no orders yet.</div>
      ) : (
        <ul className="cart-list">
          {orders.map(o => (
            <li key={o._id} className="cart-item">
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>Order #{o._id}</div>
                <div>Placed: {formatDate(o.createdAt)}</div>
                <div>Delivery: {formatDate(o.deliveryDate)}</div>
                <div>Status: {o.status} — Payment: {o.paymentStatus}</div>
                <div style={{ marginTop: 8 }}>
                  {o.items.map(it => (
                    <div key={it.car?._id || it.car} style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                      <img src={it.car?.images?.[0] || '/placeholder.png'} alt="car" style={{ width: 100, height: 64, objectFit: 'cover', borderRadius: 6 }} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{it.car?.brand} {it.car?.model} ({it.car?.year})</div>
                        <div>Owner: {it.owner || '-' }</div>
                        <div>Price: ₹{it.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomerOrders;
