import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCompare } from '../../context/CompareContext';
import { useToast } from '../../Hooks/useToast';
import { API_ENDPOINTS } from '../../config/api';
import Navbar from '../../Components/Layout/Navbar';

const LISTING_LABEL = { sale_new: 'New', sale_old: 'Used', rent: 'For Rent' };
const NA = <span className="text-gray-300 italic text-[0.82rem]">—</span>;

const getBadgeColor = (type) => {
  if (type === 'sale_new') return 'bg-emerald-100 text-emerald-800';
  if (type === 'sale_old') return 'bg-amber-100 text-amber-800';
  if (type === 'rent') return 'bg-indigo-100 text-indigo-800';
  return 'bg-gray-100 text-gray-800';
};

const getStatusBadge = (status) => {
  if (status === 'active') return <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold inline-block">Available</span>;
  if (status === 'sold') return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold inline-block">Sold</span>;
  if (status === 'rented') return <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold inline-block">Rented</span>;
  return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-bold inline-block capitalize">{status || 'Inactive'}</span>;
};

// Rows to display in the comparison table
const SPEC_ROWS = [
  { key: 'price',        label: '💰 Price',        format: (v, car) => v != null ? `₹${Number(v).toLocaleString('en-IN')}${car.listingType === 'rent' ? ' /day' : ''}` : NA },
  { key: 'year',         label: '📅 Year',          format: (v) => v ?? NA },
  { key: 'fuelType',     label: '⛽ Fuel Type',     format: (v) => v || NA },
  { key: 'transmission', label: '🔧 Transmission',  format: (v) => v ? v.charAt(0).toUpperCase() + v.slice(1) : NA },
  { key: 'capacity',     label: '👥 Seating',       format: (v) => v ? `${v} Seats` : NA },
  { key: 'mileage',      label: '🛣️ Mileage',       format: (v) => v != null && v !== 0 ? `${Number(v).toLocaleString('en-IN')} km` : NA },
  { key: 'color',        label: '🎨 Color',         format: (v) => v || NA },
  { key: 'location',     label: '📍 Location',      format: (v) => v || NA },
  { key: 'status',       label: '✅ Availability',  format: (v) => getStatusBadge(v) },
  { key: 'description',  label: '📝 Description',   format: (v) => v ? <span className="text-[0.8rem] text-gray-500">{v.length > 80 ? v.slice(0, 80) + '…' : v}</span> : NA },
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 pb-20 pt-24">
        <Navbar />
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-600 to-purple-700 pt-20 pb-12 px-8 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(255,255,255,0.07),transparent_60%),radial-gradient(ellipse_at_80%_30%,rgba(255,255,255,0.05),transparent_50%)] pointer-events-none"></div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight relative z-10">⚖️ Car Comparison</h1>
          <p className="text-lg opacity-85 relative z-10">Select 2 to 4 cars to compare side by side</p>
        </div>
        <div className="max-w-[1300px] mx-auto px-6 pt-10">
          <div className="text-center py-24 px-8">
            <span className="text-[5rem] block mb-5">⚖️</span>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Not enough cars selected</h2>
            <p className="text-base text-gray-500 mb-8 max-w-lg mx-auto">
              {cars.length === 0
                ? 'You haven\'t selected any cars yet.'
                : 'Please select at least one more car to compare.'}
              {' '}Use the <strong className="text-gray-700">⚖️ Compare</strong> button on any car listing.
            </p>
            <Link 
              to="/dashboard" 
              className="inline-block bg-gradient-to-br from-indigo-500 to-purple-500 text-white px-8 py-3 rounded-xl font-bold shadow-[0_4px_15px_rgba(99,102,241,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(99,102,241,0.45)]"
            >
              Browse Cars
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 pb-20 pt-24">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-600 to-purple-700 pt-20 pb-12 px-8 text-center text-white relative overflow-hidden mt-[-6rem]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(255,255,255,0.07),transparent_60%),radial-gradient(ellipse_at_80%_30%,rgba(255,255,255,0.05),transparent_50%)] pointer-events-none"></div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight relative z-10">⚖️ Car Comparison</h1>
        <p className="text-lg opacity-85 relative z-10">Comparing {cars.length} cars side by side</p>
      </div>

      <div className="max-w-[1300px] mx-auto px-6 pt-10">
        
        {/* Top bar */}
        <div className="flex items-center gap-4 mb-8 flex-wrap">
          <button 
            className="bg-white border-2 border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 cursor-pointer transition-all duration-200 hover:bg-gray-50 flex items-center gap-2" 
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
          <button 
            className="bg-transparent border-2 border-red-300 rounded-lg px-4 py-2 text-sm font-semibold text-red-500 cursor-pointer transition-all duration-200 hover:bg-red-50" 
            onClick={() => { clearCompare(); navigate(-1); }}
          >
            🗑️ Clear All
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl shadow-[0_6px_30px_rgba(0,0,0,0.08)] bg-white border border-gray-100">
          <table className="w-full min-w-[600px] border-collapse bg-white text-left text-sm text-gray-500">
            
            {/* Car headers */}
            <thead>
              <tr>
                <th className="bg-blue-50/50 w-[160px] min-w-[140px] px-4 py-6 text-[0.85rem] font-bold text-indigo-500 uppercase tracking-wider align-middle border-b-2 border-gray-200">
                  Specification
                </th>
                {cars.map((car) => (
                  <th key={car._id} className="p-0 align-top border-b-2 border-gray-200">
                    <div className="flex flex-col items-center px-4 pt-6 pb-4 gap-3 relative min-w-[200px]">
                      <button
                        className="absolute top-2 right-2 bg-red-100 text-red-500 hover:bg-red-200 w-6 h-6 rounded-full flex items-center justify-center text-base cursor-pointer transition-colors"
                        onClick={() => { removeFromCompare(car._id); if (cars.length <= 2) navigate(-1); }}
                        title="Remove car"
                      >
                        ×
                      </button>
                      
                      {car.images?.[0] ? (
                        <img 
                          src={car.images[0]} 
                          alt={`${car.brand} ${car.model}`} 
                          className="w-full max-w-[190px] h-[120px] object-cover rounded-xl bg-indigo-50"
                          onError={(e) => { e.target.style.display = 'none'; }} 
                        />
                      ) : (
                        <div className="w-full max-w-[190px] h-[120px] rounded-xl bg-gradient-to-br from-indigo-200 to-indigo-100 flex items-center justify-center text-4xl text-indigo-500">
                          🚗
                        </div>
                      )}
                      
                      <div className="text-base font-extrabold text-gray-800 text-center leading-snug">
                        {car.brand} {car.model}
                      </div>
                      <div className="text-xs text-gray-400 font-medium -mt-1.5">
                        {car.year}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[0.72rem] font-bold uppercase tracking-wide ${getBadgeColor(car.listingType)}`}>
                        {LISTING_LABEL[car.listingType] ?? car.listingType}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Spec rows */}
            <tbody className="divide-y divide-gray-100">
              {SPEC_ROWS.map((row) => (
                <tr key={row.key} className="transition-colors hover:bg-blue-50/30 even:bg-gray-50/50 even:hover:bg-blue-50/40">
                  <td className="px-5 py-4 text-[0.82rem] font-bold text-indigo-500 bg-blue-50/50 uppercase tracking-wide whitespace-nowrap border-r-2 border-gray-200 align-middle">
                    {row.label}
                  </td>
                  {cars.map((car) => {
                    const val = car[row.key];
                    // Highlight classes
                    let isBest = false;
                    if (row.key === 'price' && val === minPrice) isBest = true;
                    if (row.key === 'mileage' && val === minMileage) isBest = true;
                    
                    return (
                      <td 
                        key={car._id} 
                        className={`px-5 py-3.5 text-sm text-gray-800 border-r border-gray-100 text-center align-middle last:border-r-0 ${isBest ? 'text-emerald-600 font-extrabold bg-emerald-50/50' : 'font-medium'}`}
                      >
                        {row.format(val, car)}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Actions row */}
              <tr className="bg-white hover:bg-white border-t-2 border-gray-200">
                <td className="px-5 py-4 text-[0.82rem] font-bold text-indigo-500 bg-blue-50/50 uppercase tracking-wide whitespace-nowrap border-r-2 border-gray-200 align-middle">
                  🛒 Actions
                </td>
                {cars.map((car) => (
                  <td key={car._id} className="p-4 text-center align-middle border-r border-gray-100 last:border-r-0">
                    <button
                      className="w-full block px-2 py-2.5 rounded-lg text-[0.82rem] font-bold cursor-pointer transition-all duration-200 mb-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
                      onClick={() => navigate(`/cars/${car._id}`)}
                    >
                      View Details
                    </button>
                    {car.status === 'active' && car.listingType !== 'rent' && (
                      <button
                        className="w-full block px-2 py-2.5 rounded-lg text-[0.82rem] font-bold cursor-pointer transition-all duration-200 bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-[0_3px_10px_rgba(99,102,241,0.3)] hover:-translate-y-px hover:shadow-[0_5px_15px_rgba(99,102,241,0.4)]"
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
        <div className="mt-5 flex gap-6 flex-wrap text-sm text-gray-500">
          <span><span className="text-emerald-600 font-bold bg-emerald-50/50 px-2 py-0.5 rounded">Green highlight</span> = Best value / Lowest mileage</span>
        </div>
        
      </div>
    </div>
  );
};

export default ComparePage;