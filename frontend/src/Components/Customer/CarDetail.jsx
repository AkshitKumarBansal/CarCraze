import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';
import { useToast } from '../../Hooks/useToast';
import { useAuth } from '../../context/AuthContext';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './CarDetail.css';
import WishlistButton from '../Common/WishlistButton';
import CompareButton from '../Common/CompareButton';

// Fix for default marker icon in Leaflet + Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

/* ── Helpers ─────────────────────────────────────────────── */
const LISTING_LABEL = { sale_new: 'New', sale_old: 'Used', rent: 'For Rent' };
const LISTING_CLASS = { sale_new: 'new', sale_old: 'used', rent: 'rent' };

const today = () => new Date().toISOString().split('T')[0];

/* ── Component ───────────────────────────────────────────── */
const CarDetail = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [rentalDates, setRentalDates] = useState({ startDate: '', endDate: '' });
  const [distanceInfo, setDistanceInfo] = useState({ distanceKm: null, durationMins: null, loading: false, error: null });

  // Delivery / Fulfillment state
  const [deliveryFulfillment, setDeliveryFulfillment] = useState('delivery');
  const [deliveryEligible, setDeliveryEligible] = useState(null);
  const [checkingDelivery, setCheckingDelivery] = useState(false);
  const [deliveryCheckMsg, setDeliveryCheckMsg] = useState('');

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  /* ── Fetch car ────────────────────────────────────────── */
  useEffect(() => {
    const fetchCar = async () => {
      try {
        const res = await fetch(`${API_ENDPOINTS.CARS}/${carId}`, {
          credentials: 'include',
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.message || 'Car not found');
        }
        const data = await res.json();
        setCar(data.car);

        // Fetch reviews after getting the car
        const reviewsRes = await fetch(`${API_ENDPOINTS.CARS}/${carId}/reviews`, {
          credentials: 'include',
        });
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData.reviews || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [carId]);

  // Set initial delivery fulfillment based on car's config
  useEffect(() => {
    if (car) {
      if (car.deliveryConfig?.type === 'pickup') {
        setDeliveryFulfillment('pickup');
      } else {
        setDeliveryFulfillment('delivery');
      }
    }
  }, [car]);

  /* ── Image navigation ─────────────────────────────────── */
  const images = car?.images?.filter(Boolean) ?? [];

  const prevImage = () =>
    setActiveIdx(i => (i === 0 ? images.length - 1 : i - 1));
  const nextImage = () =>
    setActiveIdx(i => (i === images.length - 1 ? 0 : i + 1));

  /* ── Distance Calculation ──────────────────────────────── */
  const calculateDistance = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setDistanceInfo({ distanceKm: null, durationMins: null, loading: true, error: null });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          const carLat = car.coordinates.lat;
          const carLng = car.coordinates.lng;

          // OSRM expects lon,lat format
          const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${carLng},${carLat}?overview=false`;
          const res = await fetch(osrmUrl);
          if (!res.ok) throw new Error("Failed to fetch route");
          const data = await res.json();
          
          if (data.code === "Ok" && data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const distanceKm = (route.distance / 1000).toFixed(1);
            const durationMins = Math.round(route.duration / 60);
            setDistanceInfo({ distanceKm, durationMins, loading: false, error: null });
            toast.success("Distance calculated successfully!");
          } else {
            throw new Error("Could not find a driving route");
          }
        } catch (err) {
          console.error("OSRM error:", err);
          setDistanceInfo({ distanceKm: null, durationMins: null, loading: false, error: "Unable to calculate route. You might be too far away." });
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setDistanceInfo({ distanceKm: null, durationMins: null, loading: false, error: "Could not get your location. Please check permissions." });
      }
    );
  };

  /* ── Delivery Eligibility Check ─────────────────────────── */
  const checkDeliveryEligibility = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setCheckingDelivery(true);
    setDeliveryEligible(null);
    setDeliveryCheckMsg('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          const res = await fetch(`${API_ENDPOINTS.CARS}/${carId}/check-delivery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat, lng }),
            credentials: 'include'
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to check delivery eligibility');

          setDeliveryEligible(data.eligible);
          setDeliveryCheckMsg(data.message);
          if (data.eligible) {
            toast.success("🎉 You are eligible for delivery!");
          } else {
            toast.warning("❌ Outside delivery zone. You can still pick up the car!");
          }
        } catch (err) {
          console.error("Delivery check error:", err);
          toast.error("Failed to check delivery eligibility: " + err.message);
        } finally {
          setCheckingDelivery(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Location permission denied or unavailable. Please enable location services.");
        setCheckingDelivery(false);
      }
    );
  };

  /* ── Add to cart ──────────────────────────────────────── */
  const handleAddToCart = async () => {
    if (!user) { navigate('/signin'); return; }

    if (car.deliveryConfig && deliveryFulfillment === 'delivery') {
      if ((car.deliveryConfig.type === 'radius' || car.deliveryConfig.type === 'polygon') && !deliveryEligible) {
        toast.warning('Please verify your delivery eligibility first, or choose Self-Pickup.');
        return;
      }
    }

    const isRental = car.listingType === 'rent';
    if (isRental) {
      if (!rentalDates.startDate || !rentalDates.endDate) {
        toast.warning('Please select both pickup and return dates.');
        return;
      }
      if (new Date(rentalDates.startDate) >= new Date(rentalDates.endDate)) {
        toast.warning('Return date must be after pickup date.');
        return;
      }
    }

    setAddingToCart(true);
    try {
      const body = { carId: car._id };
      if (isRental) {
        body.startDate = rentalDates.startDate;
        body.endDate = rentalDates.endDate;
      }

      const res = await fetch(API_ENDPOINTS.CART, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add to cart');

      toast.success(`🚗 ${car.brand} ${car.model} added to cart!`);
    } catch (err) {
      toast.error('❌ ' + err.message);
    } finally {
      setAddingToCart(false);
    }
  };

  const sellerInitials = (seller) => {
    if (!seller) return '?';
    return `${seller.firstName?.[0] ?? ''}${seller.lastName?.[0] ?? ''}`.toUpperCase();
  };

  /* ── Submit review ────────────────────────────────────── */
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.warning('Please sign in to leave a review.');
      navigate('/signin');
      return;
    }
    if (newReviewRating === 0) {
      toast.warning('Please select a star rating.');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`${API_ENDPOINTS.CARS}/${carId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rating: newReviewRating, comment: newReviewComment }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit review');

      toast.success('Review submitted successfully!');
      setReviews([data.review, ...reviews]);
      setNewReviewRating(0);
      setNewReviewComment('');
    } catch (err) {
      toast.error('❌ ' + err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  /* ── Back navigation context ──────────────────────────── */
  const backLabel = {
    sale_new: 'New Cars',
    sale_old: 'Used Cars',
    rent: 'Rental Cars',
  }[car?.listingType] ?? 'Cars';

  const backPath = {
    sale_new: '/new-cars',
    sale_old: '/old-cars',
    rent: '/rent-cars',
  }[car?.listingType] ?? -1;

  /* ── Loading / Error ──────────────────────────────────── */
  if (loading) {
    return (
      <div className="car-detail-page">
        <div className="cd-loading-page">
          <div className="cd-spinner" />
          <p>Loading car details…</p>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="car-detail-page">
        <div className="cd-error-page">
          <span className="cd-error-icon">🚫</span>
          <p>{error || 'Car not found.'}</p>
          <button className="cd-back-btn" onClick={() => navigate(-1)}>← Go Back</button>
        </div>
      </div>
    );
  }

  const isAvailable = car.status === 'active';
  const isRental = car.listingType === 'rent';

  return (
    <div className="car-detail-page">

      {/* ── Breadcrumb ── */}
      <div className="cd-breadcrumb">
        <div className="cd-breadcrumb-inner">
          <button className="cd-back-btn" onClick={() => navigate(backPath)}>
            ← {backLabel}
          </button>
          <span className="cd-breadcrumb-sep">/</span>
          <span className="cd-breadcrumb-current">{car.year} {car.brand} {car.model}</span>
        </div>
      </div>

      {/* ── Main two-column layout ── */}
      <div className="cd-main">

        {/* ════ LEFT COLUMN ════ */}
        <div className="cd-left">

          {/* Image Gallery */}
          <div className="cd-gallery">
            <div className="cd-gallery-main">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[activeIdx]}
                    alt={`${car.brand} ${car.model} — photo ${activeIdx + 1}`}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  {images.length > 1 && (
                    <>
                      <button className="cd-gallery-arrow left" onClick={prevImage} aria-label="Previous image">‹</button>
                      <button className="cd-gallery-arrow right" onClick={nextImage} aria-label="Next image">›</button>
                      <span className="cd-img-counter">{activeIdx + 1} / {images.length}</span>
                    </>
                  )}
                </>
              ) : (
                <div className="cd-gallery-placeholder">
                  🚗<span>No photos available</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="cd-thumbnails">
                {images.map((src, i) => (
                  <div
                    key={i}
                    className={`cd-thumb${i === activeIdx ? ' active' : ''}`}
                    onClick={() => setActiveIdx(i)}
                    role="button"
                    aria-label={`View photo ${i + 1}`}
                  >
                    <img src={src} alt={`thumb-${i + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Full Specs */}
          <div className="cd-specs-card">
            <h2>⚙️ Specifications</h2>
            <div className="cd-specs-grid">
              {[
                { icon: '⛽', label: 'Fuel Type',     value: car.fuelType       || '—' },
                { icon: '🔧', label: 'Transmission',  value: car.transmission   || '—' },
                { icon: '👥', label: 'Seating',       value: car.capacity ? `${car.capacity} Seats` : '—' },
                { icon: '📅', label: 'Year',          value: car.year           || '—' },
                { icon: '🎨', label: 'Colour',        value: car.color          || '—' },
                { icon: '🛣️',  label: 'Mileage',      value: car.mileage ? `${Number(car.mileage).toLocaleString('en-IN')} km` : '—' },
              ].map(spec => (
                <div className="cd-spec-item" key={spec.label}>
                  <span className="cd-spec-icon">{spec.icon}</span>
                  <span className="cd-spec-label">{spec.label}</span>
                  <span className="cd-spec-value">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {car.description && (
            <div className="cd-desc-card">
              <h2>About this car</h2>
              <p className="cd-desc-text">{car.description}</p>
            </div>
          )}

          {/* Reviews & Ratings */}
          <div className="cd-reviews-section">
            <h2>Reviews & Ratings</h2>
            
            {/* Add Review Form */}
            <div className="cd-add-review-card">
              {user ? (
                <form onSubmit={handleReviewSubmit} className="cd-review-form">
                  <h4>Leave a Review</h4>
                  <div className="cd-star-rating-input">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span 
                        key={star} 
                        className={`cd-star ${star <= newReviewRating ? 'filled' : ''}`}
                        onClick={() => setNewReviewRating(star)}
                        role="button"
                        aria-label={`Rate ${star} stars`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <textarea
                    placeholder="Share your thoughts about this car (optional)"
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    rows="3"
                    className="cd-review-textarea"
                  />
                  <button 
                    type="submit" 
                    className="cd-btn-submit-review"
                    disabled={submittingReview || newReviewRating === 0}
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <div className="cd-login-prompt">
                  <p>Please <a href="/signin">sign in</a> to leave a review.</p>
                </div>
              )}
            </div>

            {/* Reviews List */}
            <div className="cd-reviews-list">
              {reviews.length > 0 ? (
                reviews.map(review => (
                  <div key={review._id} className="cd-review-card">
                    <div className="cd-review-header">
                      <div className="cd-reviewer-info">
                        <div className="cd-reviewer-avatar">
                          {review.user?.firstName?.[0] ?? 'A'}
                        </div>
                        <span className="cd-reviewer-name">
                          {review.user?.firstName} {review.user?.lastName}
                        </span>
                      </div>
                      <span className="cd-review-date">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="cd-review-stars">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                    {review.comment && (
                      <p className="cd-review-comment">{review.comment}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="cd-no-reviews">
                  <span className="cd-no-reviews-icon">💬</span>
                  <p>No reviews yet. Be the first to review this car!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ════ RIGHT COLUMN (sticky) ════ */}
        <div className="cd-right">

          {/* Info card */}
          <div className="cd-info-card">
            {/* Badges */}
            <div className="cd-badges">
              <span className={`cd-badge ${LISTING_CLASS[car.listingType] ?? ''}`}>
                {LISTING_LABEL[car.listingType] ?? car.listingType}
              </span>
              <span className={`cd-badge ${car.status}`}>
                {car.status === 'active' ? '✅ Available'
                  : car.status === 'sold' ? '🔴 Sold'
                  : car.status === 'rented' ? '🟡 Currently Rented'
                  : car.status}
              </span>
            </div>

            {/* Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h1 className="cd-car-title" style={{ margin: 0 }}>{car.brand} {car.model}</h1>
              <WishlistButton carId={car._id} size="md" />
              <CompareButton car={car} size="md" />
            </div>
            <p className="cd-car-subtitle">
              {car.year} &middot; {car.transmission} &middot; {car.fuelType}
            </p>

            {/* Quick specs chips */}
            <div className="cd-quick-specs">
              <span className="cd-qs-chip">⛽ {car.fuelType}</span>
              <span className="cd-qs-chip">🔧 {car.transmission}</span>
              <span className="cd-qs-chip">👥 {car.capacity} Seats</span>
              {car.color && <span className="cd-qs-chip">🎨 {car.color}</span>}
            </div>

            {/* Price */}
            <div className="cd-price-block">
              <span className="cd-price-amount">₹{Number(car.price).toLocaleString('en-IN')}</span>
              {isRental && <span className="cd-price-unit">/ day</span>}
            </div>

            {/* Rental date pickers */}
            {isRental && isAvailable && (
              <div className="cd-rental-dates">
                <h4>📅 Select Rental Dates</h4>
                <div className="cd-date-row">
                  <div className="cd-date-field">
                    <label htmlFor="cd-start-date">Pickup Date</label>
                    <input
                      type="date"
                      id="cd-start-date"
                      min={today()}
                      value={rentalDates.startDate}
                      onChange={e => setRentalDates(d => ({ ...d, startDate: e.target.value }))}
                    />
                  </div>
                  <div className="cd-date-field">
                    <label htmlFor="cd-end-date">Return Date</label>
                    <input
                      type="date"
                      id="cd-end-date"
                      min={rentalDates.startDate || today()}
                      value={rentalDates.endDate}
                      onChange={e => setRentalDates(d => ({ ...d, endDate: e.target.value }))}
                    />
                  </div>
                </div>
                {rentalDates.startDate && rentalDates.endDate && (() => {
                  // Use UTC dates to avoid timezone issues
                  const start = new Date(rentalDates.startDate + 'T00:00:00Z');
                  const end = new Date(rentalDates.endDate + 'T00:00:00Z');
                  if (end < start) return null;
                  // Calculate inclusive number of days. +1 because a 1-day rental (e.g., 10th-10th) has a 0ms difference.
                  const days = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;

                  return days > 0 ? (
                    <p style={{ margin: '0.6rem 0 0', fontSize: '0.82rem', color: '#6366f1', fontWeight: 600 }}>
                      🗓️ {days} day{days > 1 ? 's' : ''} &nbsp;→&nbsp; ₹{(days * car.price).toLocaleString('en-IN')} total
                    </p>
                  ) : null;
                })()}
              </div>
            )}

            {/* 🚚 Delivery & Fulfillment Options */}
            {car.deliveryConfig && isAvailable && (
              <div className="cd-fulfillment-section" style={{
                margin: '1.25rem 0',
                padding: '1rem',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1f2937' }}>
                  📦 Fulfillment Options
                </h4>
                
                {car.deliveryConfig.type === 'pickup' ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#4b5563',
                    fontSize: '0.875rem',
                    padding: '0.5rem',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <span>📍</span>
                    <span><strong>Pickup Only:</strong> This car is only available for pickup from the seller's location.</span>
                  </div>
                ) : (
                  <div>
                    {/* Toggle Options */}
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      marginBottom: '1rem'
                    }}>
                      <button
                        type="button"
                        onClick={() => {
                          setDeliveryFulfillment('delivery');
                        }}
                        style={{
                          flex: 1,
                          padding: '0.6rem',
                          borderRadius: '6px',
                          border: deliveryFulfillment === 'delivery' ? '2px solid #6366f1' : '1px solid #d1d5db',
                          backgroundColor: deliveryFulfillment === 'delivery' ? '#e0e7ff' : '#ffffff',
                          color: deliveryFulfillment === 'delivery' ? '#4338ca' : '#374151',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        🚚 Home Delivery
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeliveryFulfillment('pickup');
                        }}
                        style={{
                          flex: 1,
                          padding: '0.6rem',
                          borderRadius: '6px',
                          border: deliveryFulfillment === 'pickup' ? '2px solid #6366f1' : '1px solid #d1d5db',
                          backgroundColor: deliveryFulfillment === 'pickup' ? '#e0e7ff' : '#ffffff',
                          color: deliveryFulfillment === 'pickup' ? '#4338ca' : '#374151',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        📍 Self-Pickup
                      </button>
                    </div>

                    {/* Delivery Status/Details */}
                    {deliveryFulfillment === 'delivery' && (
                      <div style={{ fontSize: '0.85rem', color: '#4b5563' }}>
                        {car.deliveryConfig.type === 'anywhere' && (
                          <div style={{ padding: '0.5rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '6px', color: '#065f46', fontWeight: 500 }}>
                            ✅ Free home delivery is available anywhere!
                          </div>
                        )}

                        {(car.deliveryConfig.type === 'radius' || car.deliveryConfig.type === 'polygon') && (
                          <div>
                            <p style={{ margin: '0 0 0.5rem 0' }}>
                              Seller delivers within a restricted zone. Please verify your address:
                            </p>
                            <button
                              type="button"
                              onClick={checkDeliveryEligibility}
                              disabled={checkingDelivery}
                              style={{
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                backgroundColor: '#6366f1',
                                border: 'none',
                                color: '#ffffff',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                transition: 'background-color 0.2s'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6366f1'}
                            >
                              {checkingDelivery ? '⏳ Checking location...' : '🔍 Check Delivery Eligibility'}
                            </button>

                            {deliveryEligible === true && (
                              <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '6px', color: '#065f46', fontWeight: 500 }}>
                                🎉 Great news! You are eligible for delivery: <em>{deliveryCheckMsg}</em>
                              </div>
                            )}

                            {deliveryEligible === false && (
                              <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#991b1b' }}>
                                ❌ Outside delivery zone: <em>{deliveryCheckMsg}</em>.<br />
                                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginTop: '0.25rem' }}>You can still choose <strong>Self-Pickup</strong> to order!</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {deliveryFulfillment === 'pickup' && (
                      <div style={{ padding: '0.5rem', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '6px', color: '#374151', fontSize: '0.85rem' }}>
                        📍 You've selected <strong>Self-Pickup</strong>. You will need to pick up the car directly from the seller's location in <strong>{car.location || "seller's address"}</strong>.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* CTA */}
            <div className="cd-cta-group">
              {isAvailable ? (
                <button
                  className="cd-btn-cart"
                  onClick={handleAddToCart}
                  disabled={addingToCart || (car.deliveryConfig && deliveryFulfillment === 'delivery' && (car.deliveryConfig.type === 'radius' || car.deliveryConfig.type === 'polygon') && deliveryEligible !== true)}
                  id="cd-add-to-cart-btn"
                >
                  {addingToCart ? '⏳ Adding…' : '🛒 Add to Cart'}
                </button>
              ) : (
                <button className="cd-btn-unavailable" disabled>
                  {car.status === 'sold' ? '🔴 This car has been sold'
                    : car.status === 'rented' ? '🟡 Currently rented out'
                    : '⛔ Not available'}
                </button>
              )}
            </div>

            <hr className="cd-divider" style={{ margin: '1.25rem 0' }} />

            {/* Location & Map */}
            {car.location && (
              <div className="cd-location-row" style={{ marginBottom: '1rem' }}>
                <span>📍</span>
                <span>{car.location}</span>
              </div>
            )}

            {car.coordinates && (
              <div className="cd-distance-calculator" style={{ marginBottom: '1rem' }}>
                <button 
                  className="option-button small" 
                  onClick={calculateDistance}
                  disabled={distanceInfo.loading}
                  style={{ width: '100%', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                >
                  {distanceInfo.loading ? '⏳ Calculating...' : '🚗 Calculate Driving Distance'}
                </button>
                {distanceInfo.distanceKm !== null && (
                  <div style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', color: '#166534', fontSize: '0.875rem', textAlign: 'center' }}>
                    <strong>{distanceInfo.distanceKm} km away</strong><br />
                    approx {distanceInfo.durationMins} mins driving
                  </div>
                )}
                {distanceInfo.error && (
                  <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#991b1b', fontSize: '0.875rem', textAlign: 'center' }}>
                    {distanceInfo.error}
                  </div>
                )}
              </div>
            )}

            {car.coordinates && (
              <div className="cd-map-container" style={{ height: '200px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb', position: 'relative', zIndex: 1 }}>
                <MapContainer 
                  center={[car.coordinates.lat, car.coordinates.lng]} 
                  zoom={14} 
                  style={{ height: '100%', width: '100%', zIndex: 1 }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  <Marker position={[car.coordinates.lat, car.coordinates.lng]} />
                </MapContainer>
              </div>
            )}
          </div>

          {/* Seller card */}
          {car.sellerId && (
            <div className="cd-seller-card">
              <h3>Listed by</h3>
              <div className="cd-seller-profile">
                <div className="cd-seller-avatar">
                  {sellerInitials(car.sellerId)}
                </div>
                <div>
                  <div className="cd-seller-name">
                    {car.sellerId.firstName} {car.sellerId.lastName}
                  </div>
                  {car.sellerId.businessInfo?.name && (
                    <div className="cd-seller-business">
                      🏪 {car.sellerId.businessInfo.name}
                    </div>
                  )}
                </div>
              </div>
              <div className="cd-seller-contacts">
                {car.sellerId.email && (
                  <div className="cd-seller-contact-item">
                    <span>📧</span>
                    <a href={`mailto:${car.sellerId.email}`}>{car.sellerId.email}</a>
                  </div>
                )}
                {car.sellerId.phone && (
                  <div className="cd-seller-contact-item">
                    <span>📞</span>
                    <a href={`tel:${car.sellerId.phone}`}>{car.sellerId.phone}</a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarDetail;
