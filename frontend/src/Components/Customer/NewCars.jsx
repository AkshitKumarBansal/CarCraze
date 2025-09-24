import React, { useEffect, useState } from 'react';
import './CustomerDashboard.css';
import { useNavigate } from 'react-router-dom';
import './NewCars.css';

const NewCars = () => {
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
        const onlyNew = all.filter(c => c.listingType === 'sale_new');
        setCars(onlyNew);
      } catch (err) {
        console.error('Error fetching new cars:', err);
        setError('Unable to load new cars. Please try again later.');
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
      <h1 className="dashboard-header">New Cars</h1>
      <p className="dashboard-content">Browse the latest brand new cars available.</p>
      <button className="option-button small back-button" onClick={() => navigate(-1)}>← Back</button>
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
        <h2 className="catalog-title">All New Cars</h2>
        {loading && <div className="catalog-status">Loading new cars...</div>}
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

export default NewCars;
