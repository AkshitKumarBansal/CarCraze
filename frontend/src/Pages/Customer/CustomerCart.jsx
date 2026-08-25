import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { useToast } from '../../Hooks/useToast';
import { useNavigate } from 'react-router-dom'; // ADDED THIS
import { useAuth } from '../../context/AuthContext'; // ADDED THIS

const CustomerCart = () => {
  const toast = useToast();
  const navigate = useNavigate(); // ADDED THIS
  const { user } = useAuth(); // ADDED THIS
  
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkoutStatus, setCheckoutStatus] = useState(null);

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
    // --- ADDED VERIFICATION GUARD ---
    if (user?.verification?.status !== 'verified') {
      toast.warning('⚠️ Identity verification is required to place an order.');
      navigate('/profile'); // Redirect to profile to upload documents
      return; 
    }
    // --------------------------------

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
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf1] py-10 px-5 pt-24">
      <div className="text-center mb-10">
        <h1 className="text-[2.5rem] font-bold bg-gradient-to-br from-[#667eea] to-[#764ba2] bg-clip-text text-transparent mb-2.5">🛒 Shopping Cart</h1>
      </div>
      <div className="text-center py-16 px-5 text-[1.1rem] text-gray-500 animate-pulse">Loading your cart...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf1] py-10 px-5 pt-24">
      <div className="text-center mb-10">
        <h1 className="text-[2.5rem] font-bold bg-gradient-to-br from-[#667eea] to-[#764ba2] bg-clip-text text-transparent mb-2.5">🛒 Shopping Cart</h1>
      </div>
      <div className="text-center py-16 px-5 text-[1.1rem] text-red-500">{error}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf1] py-10 px-5 pt-24">
      <div className="text-center mb-10">
        <h1 className="text-[2.5rem] md:text-[3rem] font-bold bg-gradient-to-br from-[#667eea] to-[#764ba2] bg-clip-text text-transparent mb-2.5">🛒 Shopping Cart</h1>
        <p className="text-gray-500 text-[1.1rem] m-0">
          {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} in your cart
        </p>
      </div>

      {cart.items.length === 0 ? (
        <div className="text-center py-20 px-5 bg-white rounded-[20px] max-w-[600px] mx-auto shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
          <div className="text-[5rem] mb-5 opacity-60">🛒</div>
          <h2 className="text-[1.8rem] text-gray-800 m-0 mb-2.5 font-bold">Your cart is empty</h2>
          <p className="text-gray-500 text-[1.1rem] m-0 mb-8">Add some amazing cars to get started!</p>
          <a href="/dashboard" className="inline-block bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white py-[14px] px-8 rounded-lg no-underline font-semibold text-base transition-all duration-300 shadow-[0_4px_15px_rgba(102,126,234,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(102,126,234,0.4)]">
            Browse Cars
          </a>
        </div>
      ) : (
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-[30px]">
          
          {/* Cart Items Section */}
          <div className="flex flex-col gap-5">
            {cart.items.map(item => (
              <div key={item.car._id || item.car} className="bg-white rounded-2xl p-6 flex flex-col md:flex-row gap-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-0.5">
                
                <div className="shrink-0 w-full md:w-[180px] h-[200px] md:h-[120px] rounded-xl overflow-hidden">
                  <img
                    src={item.car.images?.[0] || '/placeholder.png'}
                    alt={`${item.car.brand} ${item.car.model}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 flex flex-col gap-2">
                  <h3 className="text-[1.3rem] font-bold text-gray-800 m-0">
                    {item.car.brand} {item.car.model}
                  </h3>
                  <p className="text-gray-500 text-[0.95rem] m-0">Year: {item.car.year}</p>
                  
                  <div className="flex gap-2 items-center mt-1">
                    <span className="text-gray-400 text-[0.9rem]">Seller:</span>
                    <span className="text-gray-700 font-semibold text-[0.95rem]">
                      {item.owner?.firstName || ''} {item.owner?.lastName || ''}
                    </span>
                  </div>
                  
                  <div className="text-gray-500 text-[0.9rem] mt-1">
                    <span>📧 {item.owner?.email || 'N/A'}</span>
                  </div>

                  {/* Rental Information Display */}
                  {item.car.listingType === 'rent' && item.startDate && item.endDate && (
                    <div className="p-2 bg-green-50 rounded-lg border border-green-200 text-[0.85rem] mt-2">
                      <div className="mb-1">
                        <strong>Pickup:</strong> {formatDateTime(item.startDate)}
                      </div>
                      <div className="mb-1">
                        <strong>Return:</strong> {formatDateTime(item.endDate)}
                      </div>
                      <div className="text-green-800 font-bold">
                        (Duration: {calculateDuration(item.startDate, item.endDate)})
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                  <div className="text-[1.5rem] font-bold text-[#667eea]">
                    ₹{item.price.toLocaleString('en-IN')}
                  </div>
                  <button
                    className="bg-red-100 text-red-600 border-none py-2.5 px-5 rounded-lg font-semibold cursor-pointer transition-all duration-200 hover:bg-red-200 hover:scale-105"
                    onClick={() => removeItem(item.car._id || item.car)}
                  >
                    Remove
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* Summary Section */}
          <div className="lg:sticky lg:top-5 h-fit">
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
              <h3 className="text-[1.4rem] font-bold text-gray-800 m-0 mb-5">Order Summary</h3>
              
              <div className="flex justify-between py-3 text-gray-500 text-[0.95rem]">
                <span>Subtotal ({cart.items.length} items)</span>
                <span>₹{cart.total.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="flex justify-between py-3 text-gray-500 text-[0.95rem]">
                <span>Taxes</span>
                <span>Calculated at checkout</span>
              </div>
              
              <div className="h-px bg-gray-200 my-4"></div>
              
              <div className="flex justify-between py-3 text-[1.3rem] font-bold text-gray-800">
                <span>Total</span>
                <span>₹{cart.total.toLocaleString('en-IN')}</span>
              </div>

              <div className="mt-6">
                <h4 className="text-[1.1rem] font-semibold text-gray-700 m-0 mb-4">Payment Method</h4>
                
                <button
                  className="w-full p-3.5 mb-2.5 rounded-lg font-semibold text-[0.95rem] cursor-pointer transition-all duration-200 bg-gradient-to-br from-[#667eea] to-[#764ba2] border-none text-white shadow-[0_4px_15px_rgba(102,126,234,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(102,126,234,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                  onClick={() => checkout('online')}
                  disabled={checkoutStatus === 'processing'}
                >
                  💳 Pay Online
                </button>
                
                <button
                  className="w-full p-3.5 mb-2.5 rounded-lg font-semibold text-[0.95rem] cursor-pointer transition-all duration-200 border-2 border-gray-200 bg-white text-gray-700 hover:border-[#667eea] hover:bg-indigo-50/50 hover:translate-x-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:border-gray-200 disabled:hover:bg-white"
                  onClick={() => checkout('upi')}
                  disabled={checkoutStatus === 'processing'}
                >
                  📱 UPI Payment
                </button>
                
                <button
                  className="w-full p-3.5 mb-2.5 rounded-lg font-semibold text-[0.95rem] cursor-pointer transition-all duration-200 border-2 border-gray-200 bg-white text-gray-700 hover:border-[#667eea] hover:bg-indigo-50/50 hover:translate-x-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:border-gray-200 disabled:hover:bg-white"
                  onClick={() => checkout('cod')}
                  disabled={checkoutStatus === 'processing'}
                >
                  💵 Cash on Delivery
                </button>
              </div>

              {checkoutStatus === 'processing' && (
                <div className="flex items-center justify-center gap-3 p-4 bg-sky-50 rounded-lg mt-4 text-sky-700 font-medium border border-sky-100">
                  <div className="w-5 h-5 border-4 border-sky-200 border-t-sky-700 rounded-full animate-spin"></div>
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