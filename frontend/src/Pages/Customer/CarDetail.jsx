import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';
import { useToast } from '../../Hooks/useToast';
import { useAuth } from '../../context/AuthContext';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import WishlistButton from '../../Components/Common/WishlistButton';
import CompareButton from '../../Components/Common/CompareButton';

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

const getBadgeStyle = (type) => {
  if (type === 'sale_new') return 'bg-green-100 text-green-700';
  if (type === 'sale_old') return 'bg-yellow-100 text-yellow-700';
  if (type === 'rent') return 'bg-indigo-100 text-indigo-700';
  return 'bg-gray-100 text-gray-700';
};

const getStatusStyle = (status) => {
  if (status === 'active') return 'bg-green-100 text-green-700';
  if (status === 'sold') return 'bg-red-100 text-red-700';
  if (status === 'rented') return 'bg-amber-100 text-amber-700';
  return 'bg-gray-100 text-gray-700';
};

// Format date for datetime-local input min attribute
const now = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

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
  
  // Dynamic Pricing State
  const [pricing, setPricing] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState('');

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

  /* ── Fetch Dynamic Pricing ────────────────────────────── */
  useEffect(() => {
    const fetchPricing = async () => {
      if (car?.listingType === 'rent' && rentalDates.startDate && rentalDates.endDate) {
        const start = new Date(rentalDates.startDate);
        const end = new Date(rentalDates.endDate);
        
        if (start >= end) {
          setPricingError('Return date must be after pickup date.');
          setPricing(null);
          return;
        }

        setPricingLoading(true);
        setPricingError('');
        
        try {
          const rentalsApiUrl = API_ENDPOINTS.CARS.replace('/cars', '/rentals');
          const res = await fetch(`${rentalsApiUrl}/calculate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              carId: car._id,
              startDate: start.toISOString(),
              endDate: end.toISOString()
            })
          });
          
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Error calculating price');
          
          setPricing(data.pricingBreakdown);
        } catch (err) {
          setPricingError(err.message);
          setPricing(null);
        } finally {
          setPricingLoading(false);
        }
      } else {
        setPricing(null);
        setPricingError('');
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchPricing();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [rentalDates, car]);

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

  const prevImage = () => setActiveIdx(i => (i === 0 ? images.length - 1 : i - 1));
  const nextImage = () => setActiveIdx(i => (i === images.length - 1 ? 0 : i + 1));

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
      if (pricingError) {
        toast.warning(pricingError);
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
      <div className="min-h-screen bg-[#f8f9ff] pt-20 flex flex-col items-center justify-center gap-4 text-gray-500 font-sans">
        <div className="w-11 h-11 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-lg font-medium">Loading car details…</p>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] pt-20 flex flex-col items-center justify-center gap-4 text-gray-500 font-sans">
        <span className="text-5xl">🚫</span>
        <p className="text-lg font-medium">{error || 'Car not found.'}</p>
        <button className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-semibold transition-colors hover:bg-indigo-200 mt-2" onClick={() => navigate(-1)}>
          ← Go Back
        </button>
      </div>
    );
  }

  const isAvailable = car.status === 'active';
  const isRental = car.listingType === 'rent';

  return (
    <div className="min-h-screen bg-[#f8f9ff] pt-[4.5rem] font-sans pb-20">

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-gray-200 py-3.5">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 text-sm text-gray-500">
          <button className="text-indigo-600 font-semibold hover:bg-indigo-50 px-2 py-1 rounded-md transition-colors flex items-center gap-1.5" onClick={() => navigate(backPath)}>
            ← {backLabel}
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium">{car.year} {car.brand} {car.model}</span>
        </div>
      </div>

      {/* ── Main two-column layout ── */}
      <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">

        {/* ════ LEFT COLUMN ════ */}
        <div className="flex flex-col gap-6">

          {/* Image Gallery */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(99,102,241,0.08)]">
            <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden cursor-zoom-in group">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[activeIdx]}
                    alt={`${car.brand} ${car.model} — photo ${activeIdx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  {images.length > 1 && (
                    <>
                      <button className="absolute top-1/2 left-3.5 -translate-y-1/2 bg-white/90 text-gray-700 w-11 h-11 rounded-full flex items-center justify-center text-xl shadow-md transition-all hover:bg-white hover:scale-110 z-10 focus:outline-none" onClick={prevImage} aria-label="Previous image">‹</button>
                      <button className="absolute top-1/2 right-3.5 -translate-y-1/2 bg-white/90 text-gray-700 w-11 h-11 rounded-full flex items-center justify-center text-xl shadow-md transition-all hover:bg-white hover:scale-110 z-10 focus:outline-none" onClick={nextImage} aria-label="Next image">›</button>
                      <span className="absolute bottom-3.5 right-3.5 bg-black/50 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm z-10">
                        {activeIdx + 1} / {images.length}
                      </span>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-5xl gap-2">
                  🚗<span className="text-base font-medium">No photos available</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2.5 p-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                {images.map((src, i) => (
                  <div
                    key={i}
                    className={`shrink-0 w-[72px] h-[54px] rounded-xl overflow-hidden cursor-pointer border-[2.5px] transition-all hover:scale-105 ${i === activeIdx ? 'border-indigo-500' : 'border-transparent'}`}
                    onClick={() => setActiveIdx(i)}
                    role="button"
                    aria-label={`View photo ${i + 1}`}
                  >
                    <img src={src} alt={`thumb-${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Full Specs */}
          <div className="bg-white rounded-2xl p-7 shadow-[0_4px_24px_rgba(99,102,241,0.08)]">
            <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">⚙️ Specifications</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { icon: '⛽', label: 'Fuel Type',    value: car.fuelType   || '—' },
                { icon: '🔧', label: 'Transmission', value: car.transmission  || '—' },
                { icon: '👥', label: 'Seating',      value: car.capacity ? `${car.capacity} Seats` : '—' },
                { icon: '📅', label: 'Year',         value: car.year          || '—' },
                { icon: '🎨', label: 'Colour',       value: car.color         || '—' },
                { icon: '🛣️',  label: 'Mileage',      value: car.mileage ? `${Number(car.mileage).toLocaleString('en-IN')} km` : '—' },
              ].map(spec => (
                <div className="bg-indigo-50/50 rounded-xl p-4 flex flex-col items-center gap-1.5 text-center border border-indigo-100/50 transition-all hover:-translate-y-0.5 hover:shadow-sm" key={spec.label}>
                  <span className="text-2xl leading-none">{spec.icon}</span>
                  <span className="text-[0.7rem] font-bold uppercase tracking-wider text-gray-400">{spec.label}</span>
                  <span className="text-sm font-bold text-gray-900">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {car.description && (
            <div className="bg-white rounded-2xl p-7 shadow-[0_4px_24px_rgba(99,102,241,0.08)]">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About this car</h2>
              <p className="text-gray-600 text-[0.95rem] leading-relaxed whitespace-pre-line">{car.description}</p>
            </div>
          )}

          {/* Reviews & Ratings */}
          <div className="bg-white rounded-2xl p-7 shadow-[0_4px_24px_rgba(99,102,241,0.08)] mt-2">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Reviews & Ratings</h2>
            
            {/* Add Review Form */}
            <div className="bg-indigo-50/30 rounded-2xl p-6 mb-8 border border-indigo-100/50">
              {user ? (
                <form onSubmit={handleReviewSubmit}>
                  <h4 className="text-[1.05rem] font-semibold text-gray-700 mb-4">Leave a Review</h4>
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span 
                        key={star} 
                        className={`text-3xl cursor-pointer transition-all hover:scale-110 ${star <= newReviewRating ? 'text-amber-500' : 'text-gray-300 hover:text-amber-400'}`}
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
                    className="w-full p-4 border border-gray-300 rounded-xl font-sans resize-y min-h-[80px] mb-4 transition-colors focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                  <button 
                    type="submit" 
                    className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none py-3 px-6 rounded-xl font-semibold cursor-pointer transition-all shadow-md hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    disabled={submittingReview || newReviewRating === 0}
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <div className="text-center text-gray-500">
                  <p>Please <a href="/signin" className="text-indigo-600 font-semibold hover:underline">sign in</a> to leave a review.</p>
                </div>
              )}
            </div>

            {/* Reviews List */}
            <div className="flex flex-col gap-5">
              {reviews.length > 0 ? (
                reviews.map(review => (
                  <div key={review._id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                          {review.user?.firstName?.[0] ?? 'A'}
                        </div>
                        <span className="font-semibold text-gray-900">
                          {review.user?.firstName} {review.user?.lastName}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-amber-500 text-lg tracking-widest mb-3">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                    {review.comment && (
                      <p className="text-gray-600 leading-relaxed text-[0.95rem] m-0">{review.comment}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-indigo-50/20 rounded-2xl border border-dashed border-gray-300 text-gray-500">
                  <span className="text-4xl block mb-2">💬</span>
                  <p>No reviews yet. Be the first to review this car!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ════ RIGHT COLUMN (sticky) ════ */}
        <div className="lg:sticky lg:top-[100px] flex flex-col gap-5">

          {/* Info card */}
          <div className="bg-white rounded-2xl p-7 shadow-[0_4px_24px_rgba(99,102,241,0.08)]">
            
            {/* Badges */}
            <div className="flex gap-2 flex-wrap mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getBadgeStyle(car.listingType)}`}>
                {LISTING_LABEL[car.listingType] ?? car.listingType}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusStyle(car.status)}`}>
                {car.status === 'active' ? '✅ Available'
                  : car.status === 'sold' ? '🔴 Sold'
                  : car.status === 'rented' ? '🟡 Currently Rented'
                  : car.status}
              </span>
            </div>

            {/* Title */}
            <div className="flex items-center gap-3 flex-wrap mb-1.5">
              <h1 className="text-[1.65rem] font-extrabold text-gray-900 leading-tight m-0">{car.brand} {car.model}</h1>
              <WishlistButton carId={car._id} size="md" />
              <CompareButton car={car} size="md" />
            </div>
            <p className="text-gray-500 text-sm mb-5 font-medium">
              {car.year} &middot; {car.transmission} &middot; {car.fuelType}
            </p>

            {/* Quick specs chips */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1.5 text-xs font-semibold text-gray-700">⛽ {car.fuelType}</span>
              <span className="inline-flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1.5 text-xs font-semibold text-gray-700">🔧 {car.transmission}</span>
              <span className="inline-flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1.5 text-xs font-semibold text-gray-700">👥 {car.capacity} Seats</span>
              {car.color && <span className="inline-flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1.5 text-xs font-semibold text-gray-700">🎨 {car.color}</span>}
            </div>

            {/* Price */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 mb-5 flex items-baseline gap-2 flex-wrap">
              <span className="text-[2rem] font-extrabold text-white leading-none">₹{Number(car.price).toLocaleString('en-IN')}</span>
              {isRental && <span className="text-sm font-medium text-white/75">/ day</span>}
            </div>

            {/* Rental date pickers & Dynamic Pricing UI */}
            {isRental && isAvailable && (
              <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-5 mb-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-3">📅 Select Rental Dates & Time</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="cd-start-date" className="block text-[0.75rem] font-semibold text-gray-500 mb-1">Pickup Date</label>
                    <input
                      type="datetime-local"
                      id="cd-start-date"
                      min={now()}
                      value={rentalDates.startDate}
                      onChange={e => setRentalDates(d => ({ ...d, startDate: e.target.value }))}
                      className="w-full p-2.5 border-2 border-gray-200 rounded-xl text-[0.85rem] text-gray-900 bg-white transition-colors focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="cd-end-date" className="block text-[0.75rem] font-semibold text-gray-500 mb-1">Return Date</label>
                    <input
                      type="datetime-local"
                      id="cd-end-date"
                      min={rentalDates.startDate || now()}
                      value={rentalDates.endDate}
                      onChange={e => setRentalDates(d => ({ ...d, endDate: e.target.value }))}
                      className="w-full p-2.5 border-2 border-gray-200 rounded-xl text-[0.85rem] text-gray-900 bg-white transition-colors focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                {/* Dynamic Pricing Results */}
                {pricingLoading && (
                  <p className="mt-3 text-[0.85rem] text-gray-500 font-medium">⏳ Calculating dynamic price and availability...</p>
                )}
                
                {pricingError && !pricingLoading && (
                  <p className="mt-3 text-[0.85rem] text-red-600 font-semibold">❌ {pricingError}</p>
                )}

                {pricing && !pricingLoading && (
                  <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <p className="m-0 mb-1 text-[0.85rem] text-emerald-800 font-medium">
                      ✅ Available for {pricing.durationUnits} {pricing.rentalTier === 'hourly' ? 'Hours' : 'Days'}
                    </p>
                    
                    {pricing.surgeFee > 0 && (
                      <p className="m-0 mb-1.5 text-[0.8rem] text-red-700">
                        📈 Weekend/Holiday Surge Applied: +₹{pricing.surgeFee.toLocaleString('en-IN')}
                      </p>
                    )}
                    
                    <p className="m-0 text-[1.1rem] text-emerald-700 font-bold">
                      Total: ₹{pricing.totalCalculatedPrice.toLocaleString('en-IN')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 🚚 Delivery & Fulfillment Options */}
            {car.deliveryConfig && isAvailable && (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-5">
                <h4 className="text-[0.95rem] font-semibold flex items-center gap-2 text-gray-800 mb-3">📦 Fulfillment Options</h4>
                
                {car.deliveryConfig.type === 'pickup' ? (
                  <div className="flex items-start gap-2 text-gray-600 text-sm p-3 bg-gray-100 rounded-xl border border-gray-200">
                    <span>📍</span>
                    <span><strong>Pickup Only:</strong> This car is only available for pickup from the seller's location.</span>
                  </div>
                ) : (
                  <div>
                    {/* Toggle Options */}
                    <div className="flex gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() => setDeliveryFulfillment('delivery')}
                        className={`flex-1 p-2.5 rounded-xl font-semibold text-sm transition-all border-2 cursor-pointer ${deliveryFulfillment === 'delivery' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                      >
                        🚚 Home Delivery
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryFulfillment('pickup')}
                        className={`flex-1 p-2.5 rounded-xl font-semibold text-sm transition-all border-2 cursor-pointer ${deliveryFulfillment === 'pickup' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                      >
                        📍 Self-Pickup
                      </button>
                    </div>

                    {/* Delivery Status/Details */}
                    {deliveryFulfillment === 'delivery' && (
                      <div className="text-sm text-gray-600">
                        {car.deliveryConfig.type === 'anywhere' && (
                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-medium">
                            ✅ Free home delivery is available anywhere!
                          </div>
                        )}

                        {(car.deliveryConfig.type === 'radius' || car.deliveryConfig.type === 'polygon') && (
                          <div>
                            <p className="mb-2">Seller delivers within a restricted zone. Please verify your address:</p>
                            <button
                              type="button"
                              onClick={checkDeliveryEligibility}
                              disabled={checkingDelivery}
                              className="w-full flex justify-center items-center gap-2 p-2.5 bg-indigo-500 text-white rounded-xl font-semibold transition-colors hover:bg-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                              {checkingDelivery ? '⏳ Checking location...' : '🔍 Check Delivery Eligibility'}
                            </button>

                            {deliveryEligible === true && (
                              <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-medium">
                                🎉 Great news! You are eligible for delivery: <em className="not-italic opacity-80">{deliveryCheckMsg}</em>
                              </div>
                            )}

                            {deliveryEligible === false && (
                              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800">
                                ❌ Outside delivery zone: <em className="not-italic opacity-80">{deliveryCheckMsg}</em>.<br />
                                <span className="block mt-1 text-xs font-semibold text-gray-700">You can still choose <strong>Self-Pickup</strong> to order!</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {deliveryFulfillment === 'pickup' && (
                      <div className="p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 text-sm">
                        📍 You've selected <strong>Self-Pickup</strong>. You will need to pick up the car directly from the seller's location in <strong>{car.location || "seller's address"}</strong>.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* CTA */}
            <div className="flex flex-col gap-3">
              {isAvailable ? (
                <button
                  onClick={handleAddToCart}
                  disabled={
                    addingToCart || 
                    pricingError || 
                    pricingLoading ||
                    (car.deliveryConfig && deliveryFulfillment === 'delivery' && (car.deliveryConfig.type === 'radius' || car.deliveryConfig.type === 'polygon') && deliveryEligible !== true)
                  }
                  id="cd-add-to-cart-btn"
                  className="w-full py-3.5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none rounded-xl text-base font-bold cursor-pointer transition-all flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(99,102,241,0.3)] hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(99,102,241,0.4)] disabled:opacity-55 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  {addingToCart ? '⏳ Adding…' : '🛒 Add to Cart'}
                </button>
              ) : (
                <button className="w-full py-3.5 bg-gray-100 text-gray-400 border-none rounded-xl text-base font-bold cursor-not-allowed">
                  {car.status === 'sold' ? '🔴 This car has been sold'
                    : car.status === 'rented' ? '🟡 Currently rented out'
                    : '⛔ Not available'}
                </button>
              )}
            </div>

            <hr className="border-t border-gray-100 my-5" />

            {/* Location & Map */}
            {car.location && (
              <div className="flex items-center gap-1.5 text-gray-500 text-[0.85rem] mb-4 font-medium">
                <span>📍</span>
                <span>{car.location}</span>
              </div>
            )}

            {car.coordinates && (
              <div className="mb-4">
                <button 
                  onClick={calculateDistance}
                  disabled={distanceInfo.loading}
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors mb-2 flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {distanceInfo.loading ? '⏳ Calculating...' : '🚗 Calculate Driving Distance'}
                </button>
                {distanceInfo.distanceKm !== null && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm text-center">
                    <strong>{distanceInfo.distanceKm} km away</strong><br />
                    approx {distanceInfo.durationMins} mins driving
                  </div>
                )}
                {distanceInfo.error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm text-center">
                    {distanceInfo.error}
                  </div>
                )}
              </div>
            )}

            {car.coordinates && (
              <div className="h-[200px] w-full rounded-xl overflow-hidden border border-gray-200 relative z-0">
                <MapContainer 
                  center={[car.coordinates.lat, car.coordinates.lng]} 
                  zoom={14} 
                  className="h-full w-full z-0"
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
            <div className="bg-white rounded-2xl p-7 shadow-[0_4px_24px_rgba(99,102,241,0.08)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Listed by</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
                  {sellerInitials(car.sellerId)}
                </div>
                <div>
                  <div className="text-base font-bold text-gray-900 leading-tight">
                    {car.sellerId.firstName} {car.sellerId.lastName}
                  </div>
                  {car.sellerId.businessInfo?.name && (
                    <div className="text-sm text-gray-500 mt-0.5">
                      🏪 {car.sellerId.businessInfo.name}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                {car.sellerId.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span>📧</span>
                    <a href={`mailto:${car.sellerId.email}`} className="text-indigo-600 font-medium hover:underline">{car.sellerId.email}</a>
                  </div>
                )}
                {car.sellerId.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span>📞</span>
                    <a href={`tel:${car.sellerId.phone}`} className="text-indigo-600 font-medium hover:underline">{car.sellerId.phone}</a>
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