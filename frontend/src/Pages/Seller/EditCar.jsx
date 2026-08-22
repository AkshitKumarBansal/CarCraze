import React, { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import Navbar from '../../Components/Layout/Navbar';

// Fix for default marker icon in Leaflet + Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map clicks
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

const EditCar = () => {
  const navigate = useNavigate();
  const { carId } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    capacity: '',
    fuelType: '',
    transmission: '',
    description: '',
    listingType: 'sale_new',
    price: '',
    color: '',
    mileage: '',
    location: '',
    coordinates: { lat: 28.6139, lng: 77.2090 }, // Default New Delhi
    availability: {
      startDate: '',
      endDate: ''
    },
    rentalPricing: {
      hourlyRate: '',
      dailyRate: '',
      weekendMultiplier: '1.0'
    },
    deliveryConfig: {
      type: 'anywhere',
      pickupAvailable: true,
      radiusKm: '',
      polygon: null
    }
  });

  const fetchCarData = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.SELLER_CARS, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const car = data.cars.find(c => (c._id === carId || c.id === carId));

        if (car) {
          const formatDate = (isoString) => {
            if (!isoString) return '';
            return new Date(isoString).toISOString().split('T')[0];
          };

          setFormData({
            brand: car.brand || '',
            model: car.model || '',
            year: car.year || new Date().getFullYear(),
            capacity: car.capacity || '',
            fuelType: car.fuelType || '',
            transmission: car.transmission || '',
            description: car.description || '',
            listingType: car.listingType || 'sale_new',
            price: car.price || '',
            color: car.color || '',
            mileage: car.mileage || '',
            location: car.location || '',
            coordinates: car.coordinates || { lat: 28.6139, lng: 77.2090 },
            availability: {
              startDate: formatDate(car.availability?.startDate),
              endDate: formatDate(car.availability?.endDate)
            },
            rentalPricing: {
              hourlyRate: car.rentalPricing?.hourlyRate || '',
              dailyRate: car.rentalPricing?.dailyRate || '',
              weekendMultiplier: car.rentalPricing?.weekendMultiplier || '1.0'
            },
            deliveryConfig: car.deliveryConfig || {
              type: 'anywhere',
              pickupAvailable: true,
              radiusKm: '',
              polygon: null
            }
          });
        } else {
          setErrors({ general: 'Car not found or you do not have permission to edit it' });
        }
      } else {
        const errorData = await response.json();
        setErrors({ general: errorData.message || 'Failed to fetch car data' });
      }
    } catch (error) {
      console.error('Error fetching car data:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setInitialLoading(false);
    }
  }, [carId]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/signin');
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'seller') {
      navigate('/');
      return;
    }
    fetchCarData();
  }, [navigate, fetchCarData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (!formData.model.trim()) newErrors.model = 'Model is required';
    if (!formData.year) newErrors.year = 'Year is required';
    if (!formData.capacity) newErrors.capacity = 'Capacity is required';
    if (!formData.fuelType) newErrors.fuelType = 'Fuel type is required';
    if (!formData.transmission) newErrors.transmission = 'Transmission is required';
    if (!formData.price) newErrors.price = 'Price is required';

    const currentYear = new Date().getFullYear();
    if (formData.year < 1900 || formData.year > currentYear + 1) {
      newErrors.year = `Year must be between 1900 and ${currentYear + 1}`;
    }
    if (formData.price && (isNaN(formData.price) || parseFloat(formData.price) <= 0)) {
      newErrors.price = 'Price must be a positive number';
    }
    if (formData.capacity && (isNaN(formData.capacity) || parseInt(formData.capacity) <= 0)) {
      newErrors.capacity = 'Capacity must be a positive number';
    }
    if (formData.mileage && (isNaN(formData.mileage) || parseInt(formData.mileage) < 0)) {
      newErrors.mileage = 'Mileage must be a non-negative number';
    }

    if (formData.listingType === 'rent') {
      if (!formData.availability.startDate) newErrors['availability.startDate'] = 'Start date is required for rentals';
      if (!formData.availability.endDate) newErrors['availability.endDate'] = 'End date is required for rentals';
      
      if (formData.availability.startDate && formData.availability.endDate) {
        if (new Date(formData.availability.startDate) >= new Date(formData.availability.endDate)) {
          newErrors['availability.endDate'] = 'End date must be after start date';
        }
      }

      if (!formData.rentalPricing.hourlyRate) newErrors['rentalPricing.hourlyRate'] = 'Hourly rate is required';
      if (!formData.rentalPricing.dailyRate) newErrors['rentalPricing.dailyRate'] = 'Daily rate is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        year: parseInt(formData.year),
        capacity: parseInt(formData.capacity),
        price: parseFloat(formData.price),
        mileage: formData.mileage ? parseInt(formData.mileage) : 0,
        coordinates: formData.coordinates
      };

      if (formData.listingType === 'rent') {
        submitData.availability = formData.availability;
        submitData.rentalPricing = {
          hourlyRate: parseFloat(formData.rentalPricing.hourlyRate),
          dailyRate: parseFloat(formData.rentalPricing.dailyRate),
          weekendMultiplier: parseFloat(formData.rentalPricing.weekendMultiplier) || 1.0
        };
      } else {
        delete submitData.availability;
        delete submitData.rentalPricing;
      }

      const response = await fetch(`${API_ENDPOINTS.SELLER_CARS}/${carId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (response.ok) {
        alert('Car updated successfully!');
        navigate('/seller/dashboard');
      } else {
        setErrors({ general: data.message || 'Failed to update car' });
      }
    } catch (error) {
      console.error('Error updating car:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1980 + 2 }, (_, i) => currentYear + 1 - i);

  const inputClass = (errorField) => `w-full p-3 border-2 rounded-lg text-base transition-all bg-white focus:outline-none focus:ring-[3px] appearance-none ${
    errorField 
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' 
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/10'
  }`;

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="font-medium text-lg">Loading car details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />

      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white py-12 mt-20 mb-8 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-4">
          <button 
            className="text-white/90 hover:text-white flex items-center gap-2 text-sm font-medium self-start transition-opacity hover:opacity-80" 
            onClick={() => navigate('/seller/dashboard')}
          >
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </button>
          <div>
            <h1 className="text-4xl font-extrabold m-0">Edit Car Details</h1>
            <p className="text-lg opacity-90 m-0 mt-1">Update your car information</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
          
          {errors.general && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-3 border border-red-200 font-medium">
              <i className="fas fa-exclamation-triangle text-lg"></i>
              {errors.general}
            </div>
          )}

          {/* Basic Information */}
          <div className="mb-10 pb-8 border-b border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2 before:content-[''] before:w-1.5 before:h-6 before:bg-gradient-to-br before:from-indigo-500 before:to-purple-600 before:rounded-full">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="brand" className="font-semibold text-gray-700 text-sm">Brand *</label>
                <input type="text" id="brand" name="brand" value={formData.brand} onChange={handleInputChange} className={inputClass(errors.brand)} placeholder="e.g., Toyota, BMW, Honda" />
                {errors.brand && <span className="text-red-500 text-xs mt-0.5 flex items-center gap-1 before:content-['⚠']">{errors.brand}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="model" className="font-semibold text-gray-700 text-sm">Model *</label>
                <input type="text" id="model" name="model" value={formData.model} onChange={handleInputChange} className={inputClass(errors.model)} placeholder="e.g., Camry, X5, Civic" />
                {errors.model && <span className="text-red-500 text-xs mt-0.5 flex items-center gap-1 before:content-['⚠']">{errors.model}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="year" className="font-semibold text-gray-700 text-sm">Year *</label>
                <select id="year" name="year" value={formData.year} onChange={handleInputChange} className={`${inputClass(errors.year)} bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[position:calc(100%-12px)_center] bg-no-repeat`}>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                {errors.year && <span className="text-red-500 text-xs mt-0.5 flex items-center gap-1 before:content-['⚠']">{errors.year}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="color" className="font-semibold text-gray-700 text-sm">Color</label>
                <input type="text" id="color" name="color" value={formData.color} onChange={handleInputChange} className={inputClass()} placeholder="e.g., Black, White, Red" />
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="mb-10 pb-8 border-b border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2 before:content-[''] before:w-1.5 before:h-6 before:bg-gradient-to-br before:from-indigo-500 before:to-purple-600 before:rounded-full">
              Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="capacity" className="font-semibold text-gray-700 text-sm">Seating Capacity *</label>
                <select id="capacity" name="capacity" value={formData.capacity} onChange={handleInputChange} className={`${inputClass(errors.capacity)} bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[position:calc(100%-12px)_center] bg-no-repeat`}>
                  <option value="">Select capacity</option>
                  <option value="2">2 seats</option>
                  <option value="4">4 seats</option>
                  <option value="5">5 seats</option>
                  <option value="7">7 seats</option>
                  <option value="8">8+ seats</option>
                </select>
                {errors.capacity && <span className="text-red-500 text-xs mt-0.5 flex items-center gap-1 before:content-['⚠']">{errors.capacity}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="fuelType" className="font-semibold text-gray-700 text-sm">Fuel Type *</label>
                <select id="fuelType" name="fuelType" value={formData.fuelType} onChange={handleInputChange} className={`${inputClass(errors.fuelType)} bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[position:calc(100%-12px)_center] bg-no-repeat`}>
                  <option value="">Select fuel type</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="CNG">CNG</option>
                </select>
                {errors.fuelType && <span className="text-red-500 text-xs mt-0.5 flex items-center gap-1 before:content-['⚠']">{errors.fuelType}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="transmission" className="font-semibold text-gray-700 text-sm">Transmission *</label>
                <select id="transmission" name="transmission" value={formData.transmission} onChange={handleInputChange} className={`${inputClass(errors.transmission)} bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[position:calc(100%-12px)_center] bg-no-repeat`}>
                  <option value="">Select transmission</option>
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                </select>
                {errors.transmission && <span className="text-red-500 text-xs mt-0.5 flex items-center gap-1 before:content-['⚠']">{errors.transmission}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="mileage" className="font-semibold text-gray-700 text-sm">Mileage (km)</label>
                <input type="number" id="mileage" name="mileage" value={formData.mileage} onChange={handleInputChange} className={inputClass(errors.mileage)} placeholder="e.g., 50000" min="0" />
                {errors.mileage && <span className="text-red-500 text-xs mt-0.5 flex items-center gap-1 before:content-['⚠']">{errors.mileage}</span>}
              </div>
            </div>
          </div>

          {/* Listing Details */}
          <div className="mb-10 pb-8 border-b border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2 before:content-[''] before:w-1.5 before:h-6 before:bg-gradient-to-br before:from-indigo-500 before:to-purple-600 before:rounded-full">
              Listing Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="listingType" className="font-semibold text-gray-700 text-sm">Listing Type *</label>
                <select id="listingType" name="listingType" value={formData.listingType} onChange={handleInputChange} className={`${inputClass()} bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[position:calc(100%-12px)_center] bg-no-repeat`}>
                  <option value="sale_new">Sell (New Car)</option>
                  <option value="sale_old">Sell (Old Car)</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="price" className="font-semibold text-gray-700 text-sm">
                  {formData.listingType === 'rent' ? 'Fallback / Base Price (per day) *' : 'Price *'}
                </label>
                <input type="number" id="price" name="price" value={formData.price} onChange={handleInputChange} className={inputClass(errors.price)} placeholder={formData.listingType === 'rent' ? 'e.g., 1500' : 'e.g., 25000'} min="0" step="0.01" />
                {errors.price && <span className="text-red-500 text-xs mt-0.5 flex items-center gap-1 before:content-['⚠']">{errors.price}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="location" className="font-semibold text-gray-700 text-sm">Location</label>
                <input type="text" id="location" name="location" value={formData.location} onChange={handleInputChange} className={inputClass()} placeholder="e.g., New York, NY" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 mt-6">
              <label className="font-semibold text-gray-700 text-sm">Pin Exact Location on Map</label>
              <div className="h-[300px] w-full rounded-lg overflow-hidden border-2 border-gray-200 relative z-0">
                <MapContainer center={[formData.coordinates.lat, formData.coordinates.lng]} zoom={13} className="h-full w-full z-0">
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                  <LocationMarker position={formData.coordinates} setPosition={(pos) => setFormData(prev => ({ ...prev, coordinates: { lat: pos.lat, lng: pos.lng } }))} />
                  {formData.deliveryConfig.type === 'polygon' && (
                    <FeatureGroup>
                      <EditControl position='topright' onCreated={(e) => {
                          const layer = e.layer;
                          if (layer instanceof L.Polygon) {
                            const latlngs = layer.getLatLngs()[0];
                            const coordinates = latlngs.map(ll => [ll.lng, ll.lat]);
                            coordinates.push([...coordinates[0]]);
                            setFormData(prev => ({ ...prev, deliveryConfig: { ...prev.deliveryConfig, polygon: { type: 'Polygon', coordinates: [coordinates] } } }));
                          }
                        }} onDeleted={() => {
                          setFormData(prev => ({ ...prev, deliveryConfig: { ...prev.deliveryConfig, polygon: null } }));
                        }} draw={{ rectangle: false, circle: false, circlemarker: false, marker: false, polyline: false, polygon: true }} />
                    </FeatureGroup>
                  )}
                </MapContainer>
              </div>
              <p className="text-xs text-gray-500 mt-1">Click on the map to update the exact location.</p>
            </div>
          </div>

          {/* Delivery Configuration */}
          <div className="mb-10 pb-8 border-b border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2 before:content-[''] before:w-1.5 before:h-6 before:bg-gradient-to-br before:from-indigo-500 before:to-purple-600 before:rounded-full">
              Delivery Configuration
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="deliveryConfig.type" className="font-semibold text-gray-700 text-sm">Delivery Type</label>
                <select id="deliveryConfig.type" name="deliveryConfig.type" value={formData.deliveryConfig.type} className={`${inputClass()} bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[position:calc(100%-12px)_center] bg-no-repeat`} onChange={(e) => {
                    const val = e.target.value;
                    setFormData(prev => ({ ...prev, deliveryConfig: { ...prev.deliveryConfig, type: val, pickupAvailable: val === 'pickup' ? true : prev.deliveryConfig.pickupAvailable } }));
                  }}>
                  <option value="anywhere">Anywhere</option>
                  <option value="pickup">Pickup Only</option>
                  <option value="radius">Specific Radius</option>
                  <option value="polygon">Custom Polygon Zone</option>
                </select>
              </div>

              {formData.deliveryConfig.type !== 'pickup' && (
                <div className="flex flex-col justify-center mt-4 sm:mt-6">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-700 text-sm">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" checked={formData.deliveryConfig.pickupAvailable !== false} onChange={(e) => setFormData(prev => ({ ...prev, deliveryConfig: { ...prev.deliveryConfig, pickupAvailable: e.target.checked } }))} />
                    <span>Pickup Available</span>
                  </label>
                </div>
              )}

              {formData.deliveryConfig.type === 'radius' && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="deliveryConfig.radiusKm" className="font-semibold text-gray-700 text-sm">Delivery Radius (km)</label>
                  <input type="number" id="deliveryConfig.radiusKm" className={inputClass()} value={formData.deliveryConfig.radiusKm} onChange={(e) => setFormData(prev => ({ ...prev, deliveryConfig: { ...prev.deliveryConfig, radiusKm: e.target.value } }))} min="1" placeholder="e.g., 25" />
                </div>
              )}
            </div>

            {formData.deliveryConfig.type === 'polygon' && (
               <div className="flex flex-col gap-1.5 mt-6">
                 <label className="font-semibold text-gray-700 text-sm">Draw Delivery Zone</label>
                 <p className="text-xs text-gray-500">Use the polygon tool (pentagon icon) on the map above to draw the delivery boundary.</p>
               </div>
            )}
          </div>

          {/* Rental Availability & Advanced Pricing (Conditionally Rendered) */}
          {formData.listingType === 'rent' && (
            <>
              <div className="mb-10 pb-8 border-b border-gray-200">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2 before:content-[''] before:w-1.5 before:h-6 before:bg-gradient-to-br before:from-indigo-500 before:to-purple-600 before:rounded-full">
                  Rental Availability
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="availability.startDate" className="font-semibold text-gray-700 text-sm">Available From *</label>
                    <input type="date" id="availability.startDate" name="availability.startDate" value={formData.availability.startDate} onChange={handleInputChange} className={`${inputClass(errors['availability.startDate'])} text-gray-700`} min={new Date().toISOString().split('T')[0]} />
                    {errors['availability.startDate'] && <span className="text-red-500 text-xs mt-0.5 flex items-center gap-1 before:content-['⚠']">{errors['availability.startDate']}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="availability.endDate" className="font-semibold text-gray-700 text-sm">Available Until *</label>
                    <input type="date" id="availability.endDate" name="availability.endDate" value={formData.availability.endDate} onChange={handleInputChange} className={`${inputClass(errors['availability.endDate'])} text-gray-700`} min={formData.availability.startDate || new Date().toISOString().split('T')[0]} />
                    {errors['availability.endDate'] && <span className="text-red-500 text-xs mt-0.5 flex items-center gap-1 before:content-['⚠']">{errors['availability.endDate']}</span>}
                  </div>
                </div>
              </div>

              {/* Dynamic Pricing Section */}
              <div className="mb-10 p-6 bg-slate-50 border border-slate-200 rounded-xl">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Advanced Rental Pricing</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="rentalPricing.hourlyRate" className="font-semibold text-gray-700 text-sm">Hourly Rate (₹) *</label>
                    <input type="number" id="rentalPricing.hourlyRate" name="rentalPricing.hourlyRate" value={formData.rentalPricing.hourlyRate} onChange={handleInputChange} className={inputClass(errors['rentalPricing.hourlyRate'])} placeholder="e.g., 200" min="0" />
                    {errors['rentalPricing.hourlyRate'] && <span className="text-red-500 text-xs mt-0.5 flex items-center gap-1 before:content-['⚠']">{errors['rentalPricing.hourlyRate']}</span>}
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="rentalPricing.dailyRate" className="font-semibold text-gray-700 text-sm">Daily Rate (₹) *</label>
                    <input type="number" id="rentalPricing.dailyRate" name="rentalPricing.dailyRate" value={formData.rentalPricing.dailyRate} onChange={handleInputChange} className={inputClass(errors['rentalPricing.dailyRate'])} placeholder="e.g., 1500" min="0" />
                    {errors['rentalPricing.dailyRate'] && <span className="text-red-500 text-xs mt-0.5 flex items-center gap-1 before:content-['⚠']">{errors['rentalPricing.dailyRate']}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="rentalPricing.weekendMultiplier" className="font-semibold text-gray-700 text-sm">Weekend Surge Multiplier</label>
                    <input type="number" step="0.1" id="rentalPricing.weekendMultiplier" name="rentalPricing.weekendMultiplier" value={formData.rentalPricing.weekendMultiplier} onChange={handleInputChange} className={inputClass()} placeholder="e.g., 1.5 for 50% extra" min="1.0" />
                    <p className="text-xs text-gray-500 mt-1">Defaults to 1.0 (no surge)</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Description */}
          <div className="mb-10 pb-8 border-b border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2 before:content-[''] before:w-1.5 before:h-6 before:bg-gradient-to-br before:from-indigo-500 before:to-purple-600 before:rounded-full">
              Description
            </h3>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="description" className="font-semibold text-gray-700 text-sm">Car Description</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} className={`${inputClass()} min-h-[100px] resize-y`} placeholder="Describe your car's condition, features, and any additional information..." rows="4" />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-4 justify-end mt-8 pt-8 border-t border-gray-200">
            <button type="button" className="px-8 py-3 rounded-lg font-semibold bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200 hover:border-gray-300 transition-all text-center" onClick={() => navigate('/seller/dashboard')}>Cancel</button>
            <button type="submit" className="px-8 py-3 rounded-lg font-semibold bg-blue-500 text-white hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-md transition-all disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2" disabled={loading}>
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Updating Car...</>
              ) : (
                'Update Car'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCar;