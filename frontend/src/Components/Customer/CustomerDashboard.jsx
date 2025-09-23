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

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch('http://localhost:5000/api/cars');
        if (!res.ok) throw new Error(`Failed to fetch cars: ${res.status}`);
        const data = await res.json();
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
      <Hero onSearch={() => { window.location.hash = 'catalog'; }} />
      <h1 className="dashboard-header">Welcome to your Dashboard</h1>
      <p className="dashboard-content">
        Explore our services or manage your account.
      </p>

      <div className="options-grid">
        {/* New Cars Card */}
        <div className="option-card">
          <FontAwesomeIcon icon={faCar} className="option-icon" />
          <h3 className="option-title">New Cars</h3>
          <p className="option-description">Browse the latest models from top brands.</p>
          <button className="option-button" onClick={() => navigate('/new-cars')}>Explore New Cars</button>
        </div>

        {/* Old Cars Card */}
        <div className="option-card">
          <FontAwesomeIcon icon={faCarSide} className="option-icon" />
          <h3 className="option-title">Old Cars</h3>
          <p className="option-description">Find certified pre-owned vehicles at great prices.</p>
          <button className="option-button" onClick={() => navigate('/old-cars')}>Discover Old Cars</button>
        </div>

        {/* Rent Cars Card */}
        <div className="option-card">
          <FontAwesomeIcon icon={faKey} className="option-icon" />
          <h3 className="option-title">Rent Cars</h3>
          <p className="option-description">Rent a car for your next trip, short or long term.</p>
          <button className="option-button" onClick={() => navigate('/rent-cars')}>Book a Rental</button>
        </div>
      </div>

      {/* Catalog Section */}
      <div id="catalog" className="catalog-section">
        <h2 className="catalog-title">Car Catalog</h2>
        {loading && <div className="catalog-status">Loading cars...</div>}
        {error && !loading && <div className="catalog-error">{error}</div>}
        {!loading && !error && (
          <div className="catalog-grid">
            {cars.map((car) => (
              <div className="car-card" key={car.id}>
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
