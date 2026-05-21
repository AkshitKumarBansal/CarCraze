import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCompare } from '../../context/CompareContext';
import { useToast } from '../../Hooks/useToast';
import { API_ENDPOINTS } from '../../config/api';
import Navbar from '../Common/Navbar';
import './ComparePage.css';

const LISTING_LABEL = { sale_new: 'New', sale_old: 'Used', rent: 'For Rent' };
const NA = <span className="compare-na">—</span>;

// Rows to display in the comparison table
const SPEC_ROWS = [
  { key: 'price',         label: '💰 Price',         format: (v, car) => v != null ? `₹${Number(v).toLocaleString('en-IN')}${car.listingType === 'rent' ? ' /day' : ''}` : NA },
  { key: 'year',          label: '📅 Year',           format: (v) => v ?? NA },
  { key: 'fuelType',      label: '⛽ Fuel Type',      format: (v) => v || NA },
  { key: 'transmission',  label: '🔧 Transmission',   format: (v) => v ? v.charAt(0).toUpperCase() + v.slice(1) : NA },
  { key: 'capacity',      label: '👥 Seating',        format: (v) => v ? `${v} Seats` : NA },
  { key: 'mileage',       label: '🛣️ Mileage',        format: (v) => v != null && v !== 0 ? `${Number(v).toLocaleString('en-IN')} km` : NA },
  { key: 'color',         label: '🎨 Color',          format: (v) => v || NA },
  { key: 'location',      label: '📍 Location',       format: (v) => v || NA },
  { key: 'status',        label: '✅ Availability',   format: (v) => {
    const map = { active: 'Available', sold: 'Sold', rented: 'Rented', inactive: 'Inactive' };
    const cls = v === 'active' ? 'active' : v === 'sold' ? 'sold' : 'rented';
    return <span className={`compare-status-badge ${cls}`}>{map[v] || v}</span>;
  }},
  { key: 'description',   label: '📝 Description',   format: (v) => v ? <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{v.length > 80 ? v.slice(0, 80) + '…' : v}</span> : NA },
];

const ComparePage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const cars = compareList;

  // Highlight best (lowest) price
  const prices = cars.map((c) => c.price).filter((p) => p != null);
  const minPrice = prices.length ? Math.min(...prices) : null;

  // Highlight lowest mileage (only for sale cars)
  const mileages = cars.filter(c => c.listingType !== 'rent').map((c) => c.mileage).filter((m) => m != null && m !== 0);
  const minMileage = mileages.length ? Math.min(...mileages) : null;

  const handleAddToCart = async (car) => {
    try {
      const res = await fetch(API_ENDPOINTS.CART, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carId: car._id }),
      });
      if (res.status === 401) { navigate('/signin'); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      toast.success(`🛒 ${car.brand} ${car.model} added to cart!`);
    } catch (err) {
      toast.error('❌ ' + (err.message || 'Failed to add to cart'));
    }
  };

  // Not enough cars selected
  if (cars.length < 2) {
    return (
      <div className="compare-page">
        <Navbar />
        <div className="compare-header">
          <h1>⚖️ Car Comparison</h1>
          <p>Select 2 to 4 cars to compare side by side</p>
        </div>
        <div className="compare-body">
          <div className="compare-empty">
            <span className="compare-empty-icon">⚖️</span>
            <h2>Not enough cars selected</h2>
            <p>
              {cars.length === 0
                ? 'You haven\'t selected any cars yet.'
                : 'Please select at least one more car to compare.'}
              {' '}Use the <strong>⚖️ Compare</strong> button on any car listing.
            </p>
            <Link to="/dashboard" className="compare-empty-cta">Browse Cars</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="compare-page">
      <Navbar />

      {/* Header */}
      <div className="compare-header">
        <h1>⚖️ Car Comparison</h1>
        <p>Comparing {cars.length} cars side by side</p>
      </div>

      <div className="compare-body">
        {/* Top bar */}
        <div className="compare-top-bar">
          <button className="compare-back-btn" onClick={() => navigate(-1)}>← Back</button>
          <button className="compare-clear-btn" onClick={() => { clearCompare(); navigate(-1); }}>🗑️ Clear All</button>
        </div>

        {/* Table */}
        <div className="compare-table-wrapper">
          <table className="compare-table">
            {/* Car headers */}
            <thead>
              <tr>
                <th>Specification</th>
                {cars.map((car) => (
                  <th key={car._id}>
                    <div className="compare-car-header">
                      <button
                        className="compare-remove-car-btn"
                        onClick={() => { removeFromCompare(car._id); if (cars.length <= 2) navigate(-1); }}
                        title="Remove car"
                      >×</button>
                      {car.images?.[0] ? (
                        <img src={car.images[0]} alt={`${car.brand} ${car.model}`} className="compare-car-img"
                          onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <div className="compare-car-img-placeholder">🚗</div>
                      )}
                      <div className="compare-car-name">{car.brand} {car.model}</div>
                      <div className="compare-car-year">{car.year}</div>
                      <span className={`compare-listing-badge ${car.listingType}`}>
                        {LISTING_LABEL[car.listingType] ?? car.listingType}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Spec rows */}
            <tbody>
              {SPEC_ROWS.map((row) => (
                <tr key={row.key}>
                  <td className="compare-row-label">{row.label}</td>
                  {cars.map((car) => {
                    const val = car[row.key];
                    // Highlight classes
                    let extraClass = '';
                    if (row.key === 'price' && val === minPrice) extraClass = 'best-price';
                    if (row.key === 'mileage' && val === minMileage) extraClass = 'best-mileage';
                    return (
                      <td key={car._id} className={`compare-row-value ${extraClass}`}>
                        {row.format(val, car)}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Actions row */}
              <tr>
                <td className="compare-row-label">🛒 Actions</td>
                {cars.map((car) => (
                  <td key={car._id} className="compare-action-cell">
                    <button
                      className="compare-action-btn view"
                      onClick={() => navigate(`/cars/${car._id}`)}
                    >
                      View Details
                    </button>
                    {car.status === 'active' && car.listingType !== 'rent' && (
                      <button
                        className="compare-action-btn cart"
                        onClick={() => handleAddToCart(car)}
                      >
                        🛒 Add to Cart
                      </button>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div style={{ marginTop: '1.25rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.8rem', color: '#6b7280' }}>
          <span><span style={{ color: '#059669', fontWeight: 700 }}>Green highlight</span> = Best value / Lowest mileage</span>
        </div>
      </div>
    </div>
  );
};

export default ComparePage;
