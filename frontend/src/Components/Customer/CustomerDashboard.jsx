import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import './CustomerDashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faCarSide, faKey } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import Hero from '../Home/Hero';
import Service from '../Common/Service';
import ImageModal from '../Common/ImageModal';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showImage, setShowImage] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);

  // Helper function to fix image URLs with correct port
  const fixImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    return imageUrl.replace(/localhost:\d+/, 'localhost:5001');
  };

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        setError('');
  const res = await fetch(API_ENDPOINTS.CARS);
        if (!res.ok) throw new Error(`Failed to fetch cars: ${res.status}`);
        const data = await res.json();
        console.log('Fetched cars data:', data.cars); // DEBUG: See what data we get
        console.log('First car images:', data.cars[0]?.images); // DEBUG: See image URLs
        setCars(Array.isArray(data?.cars) ? data.cars.slice(0, 9) : []);
      } catch (err) {
        console.error('Error fetching cars:', err);
        setError('Unable to load car catalog. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  // Robust fallback for image errors: use local placeholders instead of a missing public asset
  const handleImageError = (e) => {
    e.currentTarget.onerror = null; // prevent infinite loop
    e.currentTarget.src = newCarsImage;
  };

  const getCarImage = (car) => {
    const first = Array.isArray(car?.images) && car.images[0] ? car.images[0] : null;
    if (first) return first;
    // choose placeholder by listing type
    if (car?.listingType === 'sale_old') return oldCarsImage;
    if (car?.listingType === 'rent') return rentCarsImage;
    return newCarsImage;
  };

  return (
    <div className="dashboard-container">
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 16px' }}>
        <button className="option-button" onClick={() => navigate('/cart')}>Open Cart</button>
      </div>
      <Hero
        onLetsGo={() => {
          const el = document.getElementById('options');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          else window.location.hash = 'options';
        }}
        onSearch={({ serviceType }) => {
          if (serviceType === 'rent') {
            navigate('/rent-cars');
          } else if (serviceType === 'buy-new') {
            navigate('/new-cars');
          } else if (serviceType === 'buy-used') {
            navigate('/old-cars');
          } else {
            // Fallback: scroll to catalog on the dashboard
            window.location.hash = 'catalog';
          }
        }}
      />
      <p className="dashboard-content">
        Explore our services or manage your account.
      </p>
  {/* Reuse the Home Service section for consistent UI (buyer view) */}
  <Service mode="buyer" />

      {/* Catalog Section - Updated image handling */}
      <div id="catalog" className="catalog-section">
        <h2 className="catalog-title">Car Catalog</h2>
        {loading && <div className="catalog-status">Loading cars...</div>}
        {error && !loading && <div className="catalog-error">{error}</div>}
        {!loading && !error && (
          <div className="catalog-grid">
            {cars.map((car) => (
              <div className="car-card" key={car._id || car.id}>
                {/* Car image: backend-provided first image or a local placeholder by listing type */}
                  <img
                    src={getCarImage(car)}
                    alt={`${car.brand} ${car.model}`}
                    className="car-image"
                    onClick={() => { setImageSrc(getCarImage(car)); setShowImage(true); }}
                    style={{ cursor: 'zoom-in' }}
                    onError={handleImageError}
                  />
                <div className="car-card-header">
                  <span className="car-brand">{car.brand}</span>
                  <span className="car-year">{car.year}</span>
                </div>
                <div className="car-model">{car.model}</div>
                <div className="car-meta">
                  <span className="chip">{car.fuelType}</span>
                  <span className="chip">{car.transmission}</span>
                  <span className="chip">{car.capacity} Seater</span>
                </div>
                <div className="car-description" title={car.description}>
                  {car.description}
                </div>
                    <div className="car-footer">
                      <span className="price">
                        {car.listingType === 'rent' ? `₹${car.price}/day` : `₹${car.price.toLocaleString('en-IN')}`}
                      </span>
                      <div className="car-footer-actions">
                        <button className="option-button small">View Details</button>
                        <button
                          className="option-button small"
                          onClick={async () => {
                            const token = localStorage.getItem('token');
                            if (!token) {
                              navigate('/signin');
                              return;
                            }
                            try {
                              const res = await fetch(API_ENDPOINTS.CART, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                body: JSON.stringify({ carId: car._id || car.id })
                              });
                              const data = await res.json();
                              if (!res.ok) {
                                throw new Error(data.message || 'Add to cart failed');
                              }
                              alert('Added to cart');
                            } catch (err) {
                              console.error('Add to cart error', err);
                              alert('Failed to add to cart: ' + (err.message || ''));
                            }
                          }}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showImage && (
        <ImageModal src={imageSrc} alt="Car image" onClose={() => setShowImage(false)} />
      )}
    </div>
  );
};

export default CustomerDashboard;
