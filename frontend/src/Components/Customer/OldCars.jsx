import React, { useEffect, useState } from 'react';
import './CustomerDashboard.css';
import { useNavigate } from 'react-router-dom';

const OldCars = () => {
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
        const all = Array.isArray(data?.cars) ? data.cars : [];
        const onlyOld = all.filter(c => c.listingType === 'sale_old');
        setCars(onlyOld);
      } catch (err) {
        console.error('Error fetching old cars:', err);
        setError('Unable to load old cars. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-header">Old Cars</h1>
      <p className="dashboard-content">Find certified pre-owned vehicles at great prices.</p>
      <button className="option-button small back-button" onClick={() => navigate(-1)}>← Back</button>
      <div className="catalog-section">
        <h2 className="catalog-title">All Old Cars</h2>
        {loading && <div className="catalog-status">Loading old cars...</div>}
        {error && !loading && <div className="catalog-error">{error}</div>}
        {!loading && !error && (
          <div className="catalog-grid">
            {cars.map(car => (
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
                  <span className="price">₹{car.price.toLocaleString('en-IN')}</span>
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

export default OldCars;
