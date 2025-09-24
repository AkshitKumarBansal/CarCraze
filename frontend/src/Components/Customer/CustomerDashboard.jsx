import React, { useEffect, useState } from 'react';
import './CustomerDashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faCarSide, faKey } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import Hero from '../Home/Hero';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Helper function to fix image URLs with correct port
  const fixImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    // Replace any localhost port with the current server port
    return imageUrl.replace(/localhost:\d+/, 'localhost:5000');
  };

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch('http://localhost:5000/api/cars');
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

  return (
    <div className="dashboard-container">
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
      <div id="options" className="options-grid">
        {/* New Cars Card */}
        <div className="option-card">
          <div className="option-icon">
            <FontAwesomeIcon icon={faCar} size="3x" />
          </div>
          <h3 className="option-title">New Cars</h3>
          <p className="option-description">Browse the latest models from top brands.</p>
          <button className="option-button" onClick={() => navigate('/new-cars')}>
            Explore New Cars
          </button>
        </div>

        {/* Old Cars Card */}
        <div className="option-card">
          <div className="option-icon">
            <FontAwesomeIcon icon={faCarSide} size="3x" />
          </div>
          <h3 className="option-title">Old Cars</h3>
          <p className="option-description">Find certified pre-owned vehicles at great prices.</p>
          <button className="option-button" onClick={() => navigate('/old-cars')}>
            Discover Old Cars
          </button>
        </div>

        {/* Rent Cars Card */}
        <div className="option-card">
          <div className="option-icon">
            <FontAwesomeIcon icon={faKey} size="3x" />
          </div>
          <h3 className="option-title">Rent Cars</h3>
          <p className="option-description">Rent a car for your next trip, short or long term.</p>
          <button className="option-button" onClick={() => navigate('/rent-cars')}>
            Book a Rental
          </button>
        </div>
      </div>

      {/* Catalog Section - Updated image handling */}
      <div id="catalog" className="catalog-section">
        <h2 className="catalog-title">Car Catalog</h2>
        {loading && <div className="catalog-status">Loading cars...</div>}
        {error && !loading && <div className="catalog-error">{error}</div>}
        {!loading && !error && (
          <div className="catalog-grid">
            {cars.map((car) => (
              <div className="car-card" key={car.id}>
                <div className="car-image-container">
                  {car.images && car.images.length > 0 ? (
                    <img 
                      src={fixImageUrl(car.images[0])} 
                      alt={`${car.brand} ${car.model}`}
                      className="car-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`car-image-placeholder ${car.images && car.images.length > 0 ? 'has-image' : ''}`}>
                    <i className="fas fa-car"></i>
                  </div>
                  {car.images && car.images.length > 1 && (
                    <div className="image-count">
                      <i className="fas fa-images"></i>
                      {car.images.length}
                    </div>
                  )}
                </div>
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
                  <button className="option-button small">View Details</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
