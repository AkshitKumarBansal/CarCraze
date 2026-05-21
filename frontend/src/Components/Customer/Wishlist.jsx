import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../Hooks/useToast';
import { API_ENDPOINTS } from '../../config/api';
import WishlistButton from '../Common/WishlistButton';
import Navbar from '../Common/Navbar';
import './Wishlist.css';

const LISTING_LABEL = { sale_new: 'New', sale_old: 'Used', rent: 'For Rent' };

const Wishlist = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { wishlistCars, loading, fetchWishlist, toggleWishlist } = useWishlist();

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
    <div className="wishlist-page">
      <Navbar />

      {/* Header */}
      <div className="wishlist-header">
        <h1>❤️ My Wishlist</h1>
        <p>Your saved cars, all in one place</p>
      </div>

      {/* Body */}
      <div className="wishlist-body">
        <div className="wishlist-top-bar">
          <button className="wishlist-back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
          {!loading && (
            <span className="wishlist-count-label">
              <strong>{wishlistCars.length}</strong> car{wishlistCars.length !== 1 ? 's' : ''} saved
            </span>
          )}
        </div>

        {loading ? (
          <div className="wishlist-loading">
            <div className="wishlist-spinner" />
            Loading your wishlist…
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistCars.length === 0 ? (
              <div className="wishlist-empty">
                <span className="wishlist-empty-icon">🤍</span>
                <h2>Your wishlist is empty</h2>
                <p>Start exploring cars and hit the ❤️ button to save your favourites here.</p>
                <Link to="/dashboard" className="wishlist-empty-cta">Browse Cars</Link>
              </div>
            ) : (
              wishlistCars.map(car => (
                <div className="wl-card" key={car._id}>
                  {/* Image */}
                  <div className="wl-card-image">
                    {car.images && car.images.length > 0 ? (
                      <img src={car.images[0]} alt={`${car.brand} ${car.model}`}
                        onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <span className="no-img-icon">🚗</span>
                    )}
                    {/* Listing type badge */}
                    <span className={`wl-listing-badge ${car.listingType}`}>
                      {LISTING_LABEL[car.listingType] ?? car.listingType}
                    </span>
                    {/* Heart remove button */}
                    <div className="wl-remove-btn">
                      <WishlistButton carId={car._id} size="sm" />
                    </div>
                  </div>

                  {/* Body */}
                  <div className="wl-card-body">
                    <div className="wl-card-title">{car.brand} {car.model}</div>
                    <div className="wl-card-year">{car.year}</div>

                    <div className="wl-chips">
                      {car.fuelType && <span className="wl-chip">⛽ {car.fuelType}</span>}
                      {car.transmission && <span className="wl-chip">🔧 {car.transmission}</span>}
                      {car.capacity && <span className="wl-chip">👥 {car.capacity} Seats</span>}
                    </div>

                    {car.location && (
                      <div className="wl-location">
                        <span>📍</span> {car.location}
                      </div>
                    )}

                    <div className="wl-card-footer">
                      <div className="wl-price">
                        ₹{Number(car.price).toLocaleString('en-IN')}
                        {car.listingType === 'rent' && <span> /day</span>}
                      </div>
                      <div className="wl-actions">
                        <button
                          className="wl-btn wl-btn-view"
                          onClick={() => navigate(`/cars/${car._id}`)}
                        >
                          View
                        </button>
                        {car.status === 'active' && car.listingType !== 'rent' && (
                          <button
                            className="wl-btn wl-btn-cart"
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
