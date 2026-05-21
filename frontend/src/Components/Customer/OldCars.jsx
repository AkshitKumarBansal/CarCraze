import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import './CustomerDashboard.css';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../Hooks/useToast';
import WishlistButton from '../Common/WishlistButton';
import CompareButton from '../Common/CompareButton';

const OldCars = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [geoSearch, setGeoSearch] = useState({ active: false, lat: null, lng: null, radius: 10 });
  const [filters, setFilters] = useState({
    priceMin: '',
    priceMax: '',
    fuelType: '',
    transmission: '',
    capacity: '',
    pickupAvailable: false
  });


  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        setError('');
        let url = API_ENDPOINTS.CARS;
        if (geoSearch.active && geoSearch.lat && geoSearch.lng) {
          url += `?lat=${geoSearch.lat}&lng=${geoSearch.lng}&radius=${geoSearch.radius}`;
        }
        const res = await fetch(url);
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
  }, [geoSearch.active, geoSearch.lat, geoSearch.lng, geoSearch.radius]);

  const handleGeoSearch = () => {
    if (geoSearch.active) {
      setGeoSearch({ ...geoSearch, active: false, lat: null, lng: null });
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGeoSearch({
            ...geoSearch,
            active: true,
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          toast.success("Location found! Showing cars near you.");
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error("Could not get your location. Please check browser permissions.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
    }
  };

  const filteredCars = cars.filter(car => {
    const matchesSearch = `${car.brand ?? ''} ${car.model ?? ''}`.toLowerCase().includes(search.toLowerCase());
    const matchesMinPrice = filters.priceMin ? car.price >= Number(filters.priceMin) : true;
    const matchesMaxPrice = filters.priceMax ? car.price <= Number(filters.priceMax) : true;
    const matchesFuel = filters.fuelType ? car.fuelType === filters.fuelType : true;
    const matchesTransmission = filters.transmission ? car.transmission === filters.transmission : true;
    const matchesCapacity = filters.capacity ? car.capacity === Number(filters.capacity) : true;
    const matchesPickup = filters.pickupAvailable 
      ? (car.deliveryConfig?.type === 'pickup' || car.deliveryConfig?.pickupAvailable !== false) 
      : true;

    return matchesSearch && matchesMinPrice && matchesMaxPrice && matchesFuel && matchesTransmission && matchesCapacity && matchesPickup;
  });

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-header">Old Cars</h1>
      <p className="dashboard-content">Find certified pre-owned vehicles at great prices.</p>
      <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
      
      {/* Search & Filters */}
      <div className="catalog-controls">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by car name (brand or model)..."
          className="search-input"
        />

        {/* Location Radius Search */}
        <div className="catalog-filters" style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            className={`btn ${geoSearch.active ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={handleGeoSearch}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
          >
            📍 {geoSearch.active ? 'Clear Location' : 'Search Near Me'}
          </button>
          
          {geoSearch.active && (
            <select 
              value={geoSearch.radius} 
              onChange={e => setGeoSearch({...geoSearch, radius: e.target.value})} 
              className="search-input"
              style={{ width: 'auto' }}
            >
              <option value="5">Within 5 km</option>
              <option value="10">Within 10 km</option>
              <option value="25">Within 25 km</option>
              <option value="50">Within 50 km</option>
              <option value="100">Within 100 km</option>
            </select>
          )}
        </div>

        <div className="catalog-filters" style={{ marginTop: '1rem' }}>
          <input type="number" placeholder="Min Price (₹)" value={filters.priceMin} onChange={e => setFilters({...filters, priceMin: e.target.value})} className="search-input" />
          <input type="number" placeholder="Max Price (₹)" value={filters.priceMax} onChange={e => setFilters({...filters, priceMax: e.target.value})} className="search-input" />
          <select value={filters.fuelType} onChange={e => setFilters({...filters, fuelType: e.target.value})} className="search-input">
            <option value="">Any Fuel</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
          </select>
          <select value={filters.transmission} onChange={e => setFilters({...filters, transmission: e.target.value})} className="search-input">
            <option value="">Any Transmission</option>
            <option value="Manual">Manual</option>
            <option value="Automatic">Automatic</option>
          </select>
          <select value={filters.capacity} onChange={e => setFilters({...filters, capacity: e.target.value})} className="search-input">
            <option value="">Any Seating</option>
            <option value="2">2 Seats</option>
            <option value="4">4 Seats</option>
            <option value="5">5 Seats</option>
            <option value="7">7 Seats</option>
            <option value="8">8 Seats</option>
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'black', fontWeight: 'bold' }}>
            <input 
              type="checkbox" 
              checked={filters.pickupAvailable} 
              onChange={e => setFilters({...filters, pickupAvailable: e.target.checked})} 
              style={{ width: 'auto', marginBottom: 0 }}
            />
            Pickup Available
          </label>
        </div>
      </div>

      <div className="catalog-section">
        <h2 className="catalog-title">All Old Cars</h2>
        {loading && <div className="catalog-status">Loading old cars...</div>}
        {error && !loading && <div className="catalog-error">{error}</div>}
        {!loading && !error && (
          <div className="catalog-grid">
            {filteredCars.map(car => (
              <div className="car-card" key={car._id || car.id}>
              <div className="car-image-container" style={{ position: 'relative' }}>
                  {car.images && car.images.length > 0 ? (
                    <img 
                      src={car.images[0]} 
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
                  <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 2 }}>
                    <WishlistButton carId={car._id || car.id} size="sm" />
                  </div>
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
                  <span className="price">₹{car.price.toLocaleString('en-IN')}</span>
                  <div className="car-footer-actions">
                    <button
                      className="option-button small"
                      onClick={() => navigate(`/cars/${car._id || car.id}`)}
                    >
                      View Details
                    </button>
                    <button
                      className="option-button small"
                      onClick={async () => {
                        try {
                          const res = await fetch(API_ENDPOINTS.CART, {
                            method: 'POST',
                            credentials: 'include',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ carId: car._id || car.id })
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
                    <CompareButton car={car} size="sm" />
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

export default OldCars;
