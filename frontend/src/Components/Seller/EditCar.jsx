import React, { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import './AddCar.css';
import Navbar from '../Common/Navbar';

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
    // Rental specific fields
    availability: {
      startDate: '',
      endDate: ''
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
      // const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.SELLER_CARS, {
        credentials: 'include',
        headers: {
          // 'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const car = data.cars.find(c => (c._id === carId || c.id === carId));

        if (car) {
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
            availability: car.availability || {
              startDate: '',
              endDate: ''
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
    // Check if user is authenticated and is a seller
    // const token = localStorage.getItem('token');
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

    // Fetch car data for editing
    fetchCarData();
  }, [navigate, fetchCarData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('availability.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        availability: {
          ...prev.availability,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (!formData.model.trim()) newErrors.model = 'Model is required';
    if (!formData.year) newErrors.year = 'Year is required';
    if (!formData.capacity) newErrors.capacity = 'Capacity is required';
    if (!formData.fuelType) newErrors.fuelType = 'Fuel type is required';
    if (!formData.transmission) newErrors.transmission = 'Transmission is required';
    if (!formData.price) newErrors.price = 'Price is required';

    // Year validation
    const currentYear = new Date().getFullYear();
    if (formData.year < 1900 || formData.year > currentYear + 1) {
      newErrors.year = `Year must be between 1900 and ${currentYear + 1}`;
    }

    // Price validation
    if (formData.price && (isNaN(formData.price) || parseFloat(formData.price) <= 0)) {
      newErrors.price = 'Price must be a positive number';
    }

    // Capacity validation
    if (formData.capacity && (isNaN(formData.capacity) || parseInt(formData.capacity) <= 0)) {
      newErrors.capacity = 'Capacity must be a positive number';
    }

    // Mileage validation
    if (formData.mileage && (isNaN(formData.mileage) || parseInt(formData.mileage) < 0)) {
      newErrors.mileage = 'Mileage must be a non-negative number';
    }

    // Rental specific validation
    if (formData.listingType === 'rent') {
      if (!formData.availability.startDate) {
        newErrors['availability.startDate'] = 'Start date is required for rentals';
      }
      if (!formData.availability.endDate) {
        newErrors['availability.endDate'] = 'End date is required for rentals';
      }
      if (formData.availability.startDate && formData.availability.endDate) {
        if (new Date(formData.availability.startDate) >= new Date(formData.availability.endDate)) {
          newErrors['availability.endDate'] = 'End date must be after start date';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // const token = localStorage.getItem('token');
      const submitData = {
        ...formData,
        year: parseInt(formData.year),
        capacity: parseInt(formData.capacity),
        price: parseFloat(formData.price),
        mileage: formData.mileage ? parseInt(formData.mileage) : 0,
        coordinates: formData.coordinates
      };

      // Only include availability for rental cars
      if (formData.listingType === 'rent') {
        submitData.availability = formData.availability;
      } else {
        delete submitData.availability;
      }

      const response = await fetch(`${API_ENDPOINTS.SELLER_CARS}/${carId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          // 'Authorization': `Bearer ${token}`,
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

  if (initialLoading) {
    return (
      <div className="add-car-container">
        <Navbar />
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading car details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="add-car-container">
      <Navbar />

      <div className="add-car-header">
        <div className="container">
          <div className="header-content">
            <button
              className="back-btn"
              onClick={() => navigate('/seller/dashboard')}
            >
              <i className="fas fa-arrow-left"></i> Back to Dashboard
            </button>
            <h1>Edit Car Details</h1>
            <p>Update your car information</p>
          </div>
        </div>
      </div>

      <div className="add-car-content">
        <div className="container">
          <form onSubmit={handleSubmit} className="add-car-form">
            {errors.general && (
              <div className="error-message general-error">
                <i className="fas fa-exclamation-triangle"></i>
                {errors.general}
              </div>
            )}

            {/* Basic Information */}
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="brand">Brand *</label>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className={errors.brand ? 'error' : ''}
                    placeholder="e.g., Toyota, BMW, Honda"
                  />
                  {errors.brand && <span className="error-text">{errors.brand}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="model">Model *</label>
                  <input
                    type="text"
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    className={errors.model ? 'error' : ''}
                    placeholder="e.g., Camry, X5, Civic"
                  />
                  {errors.model && <span className="error-text">{errors.model}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="year">Year *</label>
                  <select
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className={errors.year ? 'error' : ''}
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  {errors.year && <span className="error-text">{errors.year}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="color">Color</label>
                  <input
                    type="text"
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    placeholder="e.g., Black, White, Red"
                  />
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="form-section">
              <h3>Specifications</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="capacity">Seating Capacity *</label>
                  <select
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    className={errors.capacity ? 'error' : ''}
                  >
                    <option value="">Select capacity</option>
                    <option value="2">2 seats</option>
                    <option value="4">4 seats</option>
                    <option value="5">5 seats</option>
                    <option value="7">7 seats</option>
                    <option value="8">8+ seats</option>
                  </select>
                  {errors.capacity && <span className="error-text">{errors.capacity}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="fuelType">Fuel Type *</label>
                  <select
                    id="fuelType"
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleInputChange}
                    className={errors.fuelType ? 'error' : ''}
                  >
                    <option value="">Select fuel type</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="CNG">CNG</option>
                  </select>
                  {errors.fuelType && <span className="error-text">{errors.fuelType}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="transmission">Transmission *</label>
                  <select
                    id="transmission"
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleInputChange}
                    className={errors.transmission ? 'error' : ''}
                  >
                    <option value="">Select transmission</option>
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatic</option>
                  </select>
                  {errors.transmission && <span className="error-text">{errors.transmission}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="mileage">Mileage (km)</label>
                  <input
                    type="number"
                    id="mileage"
                    name="mileage"
                    value={formData.mileage}
                    onChange={handleInputChange}
                    className={errors.mileage ? 'error' : ''}
                    placeholder="e.g., 50000"
                    min="0"
                  />
                  {errors.mileage && <span className="error-text">{errors.mileage}</span>}
                </div>
              </div>
            </div>

            {/* Listing Details */}
            <div className="form-section">
              <h3>Listing Details</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="listingType">Listing Type *</label>
                  <select
                    id="listingType"
                    name="listingType"
                    value={formData.listingType}
                    onChange={handleInputChange}
                  >
                    <option value="sale_new">Sell (New Car)</option>
                    <option value="sale_old">Sell (Old Car)</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="price">
                    Price * {formData.listingType === 'rent' ? '(per day)' : ''}
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={errors.price ? 'error' : ''}
                    placeholder={formData.listingType === 'rent' ? 'e.g., 50' : 'e.g., 25000'}
                    min="0"
                    step="0.01"
                  />
                  {errors.price && <span className="error-text">{errors.price}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., New York, NY"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label>Pin Exact Location on Map</label>
                <div style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '2px solid #e5e7eb', position: 'relative', zIndex: 1 }}>
                  <MapContainer 
                    center={[formData.coordinates.lat, formData.coordinates.lng]} 
                    zoom={13} 
                    style={{ height: '100%', width: '100%', zIndex: 1 }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; OpenStreetMap contributors'
                    />
                    <LocationMarker 
                      position={formData.coordinates} 
                      setPosition={(pos) => setFormData(prev => ({ ...prev, coordinates: { lat: pos.lat, lng: pos.lng } }))} 
                    />
                    {formData.deliveryConfig.type === 'polygon' && (
                      <FeatureGroup>
                        <EditControl
                          position='topright'
                          onCreated={(e) => {
                             const layer = e.layer;
                             if (layer instanceof L.Polygon) {
                               const latlngs = layer.getLatLngs()[0];
                               // GeoJSON expects [lng, lat] and first/last point must be identical
                               const coordinates = latlngs.map(ll => [ll.lng, ll.lat]);
                               coordinates.push([...coordinates[0]]);
                               setFormData(prev => ({
                                  ...prev,
                                  deliveryConfig: {
                                    ...prev.deliveryConfig,
                                    polygon: { type: 'Polygon', coordinates: [coordinates] }
                                  }
                               }));
                             }
                          }}
                          onDeleted={() => {
                             setFormData(prev => ({
                                  ...prev,
                                  deliveryConfig: {
                                    ...prev.deliveryConfig,
                                    polygon: null
                                  }
                             }));
                          }}
                          draw={{
                            rectangle: false,
                            circle: false,
                            circlemarker: false,
                            marker: false,
                            polyline: false,
                            polygon: true
                          }}
                        />
                      </FeatureGroup>
                    )}
                  </MapContainer>
                </div>
                <p className="form-help" style={{ marginTop: '0.5rem' }}>Click on the map to update the exact location.</p>
              </div>
            </div>

            {/* Delivery Configuration */}
            <div className="form-section">
              <h3>Delivery Configuration</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="deliveryConfig.type">Delivery Type</label>
                  <select
                    id="deliveryConfig.type"
                    name="deliveryConfig.type"
                    value={formData.deliveryConfig.type}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({ ...prev, deliveryConfig: { ...prev.deliveryConfig, type: val, pickupAvailable: val === 'pickup' ? true : prev.deliveryConfig.pickupAvailable } }));
                    }}
                  >
                    <option value="anywhere">Anywhere</option>
                    <option value="pickup">Pickup Only</option>
                    <option value="radius">Specific Radius</option>
                    <option value="polygon">Custom Polygon Zone</option>
                  </select>
                </div>

                {formData.deliveryConfig.type !== 'pickup' && (
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '1.5rem' }}>
                      <input
                        type="checkbox"
                        checked={formData.deliveryConfig.pickupAvailable !== false}
                        onChange={(e) => setFormData(prev => ({ ...prev, deliveryConfig: { ...prev.deliveryConfig, pickupAvailable: e.target.checked } }))}
                        style={{ width: 'auto', marginBottom: 0 }}
                      />
                      <span>Pickup Available</span>
                    </label>
                  </div>
                )}

                {formData.deliveryConfig.type === 'radius' && (
                  <div className="form-group">
                    <label htmlFor="deliveryConfig.radiusKm">Delivery Radius (km)</label>
                    <input
                      type="number"
                      id="deliveryConfig.radiusKm"
                      value={formData.deliveryConfig.radiusKm}
                      onChange={(e) => setFormData(prev => ({ ...prev, deliveryConfig: { ...prev.deliveryConfig, radiusKm: e.target.value } }))}
                      min="1"
                      placeholder="e.g., 25"
                    />
                  </div>
                )}
              </div>

              {formData.deliveryConfig.type === 'polygon' && (
                 <div className="form-group" style={{ marginTop: '1.5rem' }}>
                   <label>Draw Delivery Zone</label>
                   <p className="form-help">Use the polygon tool (pentagon icon) on the map above to draw the delivery boundary.</p>
                 </div>
              )}
            </div>

            {/* Rental Availability */}
            {formData.listingType === 'rent' && (
              <div className="form-section">
                <h3>Rental Availability</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="availability.startDate">Available From *</label>
                    <input
                      type="date"
                      id="availability.startDate"
                      name="availability.startDate"
                      value={formData.availability.startDate}
                      onChange={handleInputChange}
                      className={errors['availability.startDate'] ? 'error' : ''}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {errors['availability.startDate'] && (
                      <span className="error-text">{errors['availability.startDate']}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="availability.endDate">Available Until *</label>
                    <input
                      type="date"
                      id="availability.endDate"
                      name="availability.endDate"
                      value={formData.availability.endDate}
                      onChange={handleInputChange}
                      className={errors['availability.endDate'] ? 'error' : ''}
                      min={formData.availability.startDate || new Date().toISOString().split('T')[0]}
                    />
                    {errors['availability.endDate'] && (
                      <span className="error-text">{errors['availability.endDate']}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="form-section">
              <h3>Description</h3>
              <div className="form-group">
                <label htmlFor="description">Car Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your car's condition, features, and any additional information..."
                  rows="4"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/seller/dashboard')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`btn btn-primary ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Updating Car...' : 'Update Car'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCar;
