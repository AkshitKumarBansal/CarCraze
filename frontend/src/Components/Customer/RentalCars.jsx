import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import './CustomerDashboard.css';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../Hooks/useToast';

const RentalCars = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [rentalDates, setRentalDates] = useState({ startDate: '', endDate: '' });

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
        console.log('Fetched rental cars data:', data.cars); // DEBUG: See what data we get
        const all = Array.isArray(data?.cars) ? data.cars : [];
        const onlyRent = all.filter(c => c.listingType === 'rent');
        setCars(onlyRent);
      } catch (err) {
        console.error('Error fetching rental cars:', err);
        setError('Unable to load rental cars. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  const filteredCars = cars.filter(car =>
    `${car.brand ?? ''} ${car.model ?? ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
      <h1 className="dashboard-header">Rental Cars</h1>
      <p className="dashboard-content">Rent a car for your next trip, short or long term.</p>

      {/* Search & Dates Form */}
      <div className="catalog-controls">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by car name (brand or model)..."
          className="search-input"
        />
        <div className="rental-dates-selector">
          <div>
            <label>Pickup Date *</label>
            <input
              type="date"
              value={rentalDates.startDate}
              onChange={(e) => setRentalDates({ ...rentalDates, startDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label>Return Date *</label>
            <input
              type="date"
              value={rentalDates.endDate}
              onChange={(e) => setRentalDates({ ...rentalDates, endDate: e.target.value })}
              min={rentalDates.startDate || new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </div>

      <div className="catalog-section">
        <h2 className="catalog-title">All Rental Cars</h2>
        {loading && <div className="catalog-status">Loading rental cars...</div>}
        {error && !loading && <div className="catalog-error">{error}</div>}
        {!loading && !error && (
          <div className="catalog-grid">
            {filteredCars.map(car => (
              <div className="car-card" key={car._id || car.id}>
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
                  <span className="price">₹{car.price.toLocaleString('en-IN')}/day</span>
                  <div className="car-footer-actions">
                    <button className="option-button small">View Details</button>
                    <button
                      className="option-button small"
                      onClick={async () => {
                        if (!rentalDates.startDate || !rentalDates.endDate) {
                          toast.error('❌ Please select both Pickup and Return dates before adding to cart.');
                          return;
                        }

                        try {
                          const res = await fetch(API_ENDPOINTS.CART, {
                            method: 'POST',
                            credentials: 'include',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                              carId: car._id || car.id,
                              startDate: rentalDates.startDate,
                              endDate: rentalDates.endDate 
                            })
                          });

                          if (res.status === 401) {
                            navigate('/signin');
                            return;
                          }

                          const data = await res.json();
                          if (!res.ok) {
                            throw new Error(data.message || 'Add to cart failed');
                          }
                          toast.success(`🚗 ${car.brand} ${car.model} added to cart!`);
                        } catch (err) {
                          console.error('Add to cart error', err);
                          toast.error('❌ Failed to add to cart: ' + (err.message || 'Please try again'));
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
    </div>
  );
};

export default RentalCars;
