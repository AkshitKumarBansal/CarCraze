import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../Hooks/useToast';
import WishlistButton from '../../Components/Common/WishlistButton';
import CompareButton from '../../Components/Common/CompareButton';

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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <button 
          className="mb-6 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2" 
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 mt-4 pt-4">Old Cars</h1>
        <p className="text-gray-600 mb-8 text-lg sm:text-2xl pt-4">Find certified pre-owned vehicles at great prices.</p>
        
        {/* Search & Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-10">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by car name (brand or model)..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all mb-6 text-gray-700"
          />

          {/* Location Radius Search */}
          <div className="flex flex-wrap items-center gap-4 mb-6 pt-4 border-t border-gray-100">
            <button 
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors ${geoSearch.active ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} 
              onClick={handleGeoSearch}
            >
              📍 {geoSearch.active ? 'Clear Location' : 'Search Near Me'}
            </button>
            
            {geoSearch.active && (
              <select 
                value={geoSearch.radius} 
                onChange={e => setGeoSearch({...geoSearch, radius: e.target.value})} 
                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 bg-white"
              >
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
                <option value="25">Within 25 km</option>
                <option value="50">Within 50 km</option>
                <option value="100">Within 100 km</option>
              </select>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <input type="number" placeholder="Min Price (₹)" value={filters.priceMin} onChange={e => setFilters({...filters, priceMin: e.target.value})} className="w-full sm:w-auto px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700" />
            <input type="number" placeholder="Max Price (₹)" value={filters.priceMax} onChange={e => setFilters({...filters, priceMax: e.target.value})} className="w-full sm:w-auto px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700" />
            
            <select value={filters.fuelType} onChange={e => setFilters({...filters, fuelType: e.target.value})} className="w-full sm:w-auto px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 bg-white">
              <option value="">Any Fuel</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </select>
            
            <select value={filters.transmission} onChange={e => setFilters({...filters, transmission: e.target.value})} className="w-full sm:w-auto px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 bg-white">
              <option value="">Any Transmission</option>
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
            </select>
            
            <select value={filters.capacity} onChange={e => setFilters({...filters, capacity: e.target.value})} className="w-full sm:w-auto px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 bg-white">
              <option value="">Any Seating</option>
              <option value="2">2 Seats</option>
              <option value="4">4 Seats</option>
              <option value="5">5 Seats</option>
              <option value="7">7 Seats</option>
              <option value="8">8 Seats</option>
            </select>
            
            <label className="flex items-center gap-2 cursor-pointer text-gray-800 font-semibold select-none ml-2">
              <input 
                type="checkbox" 
                checked={filters.pickupAvailable} 
                onChange={e => setFilters({...filters, pickupAvailable: e.target.checked})} 
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              Pickup Available
            </label>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Old Cars</h2>
          {loading && <div className="text-center py-12 text-gray-500 font-medium text-lg animate-pulse">Loading old cars...</div>}
          {error && !loading && <div className="text-center py-12 text-red-500 bg-red-50 rounded-xl border border-red-100">{error}</div>}
          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCars.map(car => (
                <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group" key={car._id || car.id}>
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    {car.images && car.images.length > 0 ? (
                      <img 
                        src={car.images[0]} 
                        alt={`${car.brand} ${car.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`absolute inset-0 flex items-center justify-center text-5xl text-gray-300 bg-gray-100 ${car.images && car.images.length > 0 ? 'hidden' : 'flex'}`}>
                      <i className="fas fa-car"></i>
                    </div>
                    {car.images && car.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1.5">
                        <i className="fas fa-images"></i>
                        {car.images.length}
                      </div>
                    )}
                    <div className="absolute top-2 right-2 z-10">
                      <WishlistButton carId={car._id || car.id} size="sm" />
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-gray-500 text-xs uppercase tracking-wider">{car.brand}</span>
                      <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{car.year}</span>
                    </div>
                    <div className="text-xl font-bold text-gray-900 mb-3 line-clamp-1">{car.model}</div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <span className="bg-blue-50 text-blue-700 text-[11px] font-semibold px-2.5 py-1 rounded-md">{car.fuelType}</span>
                      <span className="bg-blue-50 text-blue-700 text-[11px] font-semibold px-2.5 py-1 rounded-md">{car.transmission}</span>
                      <span className="bg-blue-50 text-blue-700 text-[11px] font-semibold px-2.5 py-1 rounded-md">{car.capacity} Seats</span>
                    </div>
                    <div className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1" title={car.description}>
                      {car.description}
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100 flex flex-col gap-3 mt-auto">
                      <span className="text-xl font-extrabold text-gray-900">
                        ₹{car.price.toLocaleString('en-IN')}
                      </span>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold rounded-lg transition-colors text-center"
                          onClick={() => navigate(`/cars/${car._id || car.id}`)}
                        >
                          View Details
                        </button>
                        <button
                          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm text-center"
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
                      </div>
                      <div className="w-full">
                        <CompareButton car={car} size="sm" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OldCars;