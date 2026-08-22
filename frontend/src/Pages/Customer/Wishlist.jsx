import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../Hooks/useToast';
import { API_ENDPOINTS } from '../../config/api';
import WishlistButton from '../../Components/Common/WishlistButton';
import Navbar from '../../Components/Layout/Navbar';

const LISTING_LABEL = { sale_new: 'New', sale_old: 'Used', rent: 'For Rent' };

const getBadgeColor = (type) => {
  if (type === 'sale_new') return 'text-emerald-600';
  if (type === 'sale_old') return 'text-amber-600';
  if (type === 'rent') return 'text-indigo-500';
  return 'text-gray-800';
};

const Wishlist = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { wishlistCars, loading, fetchWishlist } = useWishlist();

  // Refresh list when page mounts
  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const handleAddToCart = async (car) => {
    try {
      const res = await fetch(API_ENDPOINTS.CART, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carId: car._id }),
      });
      if (res.status === 401) { navigate('/signin'); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Add to cart failed');
      toast.success(`🛒 ${car.brand} ${car.model} added to cart!`);
    } catch (err) {
      toast.error('❌ ' + (err.message || 'Failed to add to cart'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9ff] to-[#f0f4ff] pb-16">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 pt-32 pb-12 px-8 text-center text-white relative overflow-hidden">
        {/* Decorative Fake Radial Glow */}
        <div className="absolute -top-[60%] -left-[20%] w-[140%] h-[200%] bg-[radial-gradient(ellipse,rgba(255,255,255,0.08)_0%,transparent_70%)] pointer-events-none"></div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight relative z-10">❤️ My Wishlist</h1>
        <p className="text-lg opacity-90 relative z-10">Your saved cars, all in one place</p>
      </div>

      {/* Body */}
      <div className="max-w-[1200px] mx-auto px-6 pt-10">
        <div className="flex items-center gap-4 mb-8 flex-wrap">
          <button 
            className="bg-white border-2 border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 flex items-center gap-2" 
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
          {!loading && (
            <span className="text-gray-500 font-medium text-base">
              <strong className="text-indigo-500 font-bold">{wishlistCars.length}</strong> car{wishlistCars.length !== 1 ? 's' : ''} saved
            </span>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500 text-base">
            <div className="w-11 h-11 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-5" />
            Loading your wishlist…
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-7">
            {wishlistCars.length === 0 ? (
              <div className="col-span-full text-center py-20 px-8">
                <span className="text-[5rem] block mb-4 animate-pulse">🤍</span>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
                <p className="text-gray-500 mb-8 text-base">Start exploring cars and hit the ❤️ button to save your favourites here.</p>
                <Link 
                  to="/dashboard" 
                  className="inline-block bg-gradient-to-br from-indigo-500 to-purple-500 text-white px-8 py-3 rounded-lg font-bold shadow-[0_4px_15px_rgba(99,102,241,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(99,102,241,0.45)]"
                >
                  Browse Cars
                </Link>
              </div>
            ) : (
              wishlistCars.map(car => (
                <div className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(0,0,0,0.12)] relative flex flex-col" key={car._id}>
                  
                  {/* Image */}
                  <div className="relative h-[185px] bg-gradient-to-br from-indigo-200 to-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                    {car.images && car.images.length > 0 ? (
                      <img 
                        src={car.images[0]} 
                        alt={`${car.brand} ${car.model}`}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }} 
                      />
                    ) : (
                      <span className="text-5xl opacity-50">🚗</span>
                    )}
                    
                    {/* Listing type badge */}
                    <span className={`absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${getBadgeColor(car.listingType)}`}>
                      {LISTING_LABEL[car.listingType] ?? car.listingType}
                    </span>
                    
                    {/* Heart remove button */}
                    <div className="absolute top-2.5 right-2.5 z-10">
                      <WishlistButton carId={car._id} size="sm" />
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="text-lg font-bold text-gray-800 mb-1">{car.brand} {car.model}</div>
                    <div className="text-sm text-gray-400 mb-3">{car.year}</div>

                    <div className="flex flex-wrap gap-2 mb-3.5">
                      {car.fuelType && <span className="bg-gray-100 rounded-full px-2.5 py-1 text-xs text-gray-700 font-medium">⛽ {car.fuelType}</span>}
                      {car.transmission && <span className="bg-gray-100 rounded-full px-2.5 py-1 text-xs text-gray-700 font-medium">🔧 {car.transmission}</span>}
                      {car.capacity && <span className="bg-gray-100 rounded-full px-2.5 py-1 text-xs text-gray-700 font-medium">👥 {car.capacity} Seats</span>}
                    </div>

                    {car.location && (
                      <div className="text-xs text-gray-400 mb-3.5 flex items-center gap-1.5">
                        <span>📍</span> {car.location}
                      </div>
                    )}

                    <div className="mt-auto flex items-center justify-between gap-2 flex-wrap pt-2">
                      <div className="text-xl font-extrabold text-indigo-500">
                        ₹{Number(car.price).toLocaleString('en-IN')}
                        {car.listingType === 'rent' && <span className="text-xs font-medium text-gray-400"> /day</span>}
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200"
                          onClick={() => navigate(`/cars/${car._id}`)}
                        >
                          View
                        </button>
                        {car.status === 'active' && car.listingType !== 'rent' && (
                          <button
                            className="px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-[0_3px_10px_rgba(99,102,241,0.3)] hover:-translate-y-px hover:shadow-[0_5px_15px_rgba(99,102,241,0.4)]"
                            onClick={() => handleAddToCart(car)}
                          >
                            🛒 Cart
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;