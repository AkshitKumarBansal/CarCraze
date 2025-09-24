import React, { useEffect, useState } from 'react';
import './CustomerDashboard.css';
import { useNavigate } from 'react-router-dom';

const RentalCars = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch('http://localhost:5000/api/cars');
        if (!res.ok) throw new Error(`Failed to fetch cars: ${res.status}`);
        const data = await res.json();
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
      <button className="option-button small back-button" onClick={() => navigate(-1)}>← Back</button>
      <h1 className="dashboard-header">Rental Cars</h1>
      <p className="dashboard-content">Rent a car for your next trip, short or long term.</p>

      {/* Search */}
      <div className="catalog-controls" style={{margin: '0 0 1rem 0'}}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by car name (brand or model)..."
          className="search-input"
          style={{width:'100%', maxWidth: '420px', padding:'10px 12px', borderRadius:'8px', border:'1px solid #ddd'}}
        />
      </div>

      <div className="catalog-section">
        <h2 className="catalog-title">All Rental Cars</h2>
        {loading && <div className="catalog-status">Loading rental cars...</div>}
        {error && !loading && <div className="catalog-error">{error}</div>}
        {!loading && !error && (
          <div className="catalog-grid">
            {filteredCars.map(car => (
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
                  <span className="price">₹{car.price.toLocaleString('en-IN')}/day</span>
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

export default RentalCars;
