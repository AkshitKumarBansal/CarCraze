import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddCar.css';
import Navbar from '../Common/Navbar';
import { API_ENDPOINTS } from '../../config/api';

const AddCar = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    // Rental specific fields
    availability: {
      startDate: '',
      endDate: ''
    }
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    // Check if user is authenticated and is a seller
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/signin');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'seller') {
      navigate('/');
      return;
    }
  }, [navigate]);

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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 5) {
      setErrors(prev => ({
        ...prev,
        images: 'Maximum 5 images allowed'
      }));
      return;
    }

    // Validate file types and sizes
    const validFiles = [];
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (let file of files) {
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          images: 'Only JPEG, PNG, and WebP images are allowed'
        }));
        return;
      }
      
      if (file.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          images: 'Each image must be less than 5MB'
        }));
        return;
      }
      
      validFiles.push(file);
    }

    setSelectedImages(validFiles);
    
    // Create preview URLs
    const previewUrls = validFiles.map(file => URL.createObjectURL(file));
    setImagePreview(previewUrls);
    
    // Clear any previous errors
    if (errors.images) {
      setErrors(prev => ({
        ...prev,
        images: ''
      }));
    }
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    
    // Revoke the URL to free memory
    URL.revokeObjectURL(imagePreview[index]);
    
    setSelectedImages(newImages);
    setImagePreview(newPreviews);
  };

  const uploadImages = async () => {
    if (selectedImages.length === 0) return [];

    setUploadingImages(true);
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      selectedImages.forEach((image, index) => {
        formData.append('images', image);
      });
      const response = await fetch(API_ENDPOINTS.UPLOAD_IMAGES, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        return data.images;
      } else {
        throw new Error(data.message || 'Failed to upload images');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    } finally {
      setUploadingImages(false);
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
      const token = localStorage.getItem('token');
      
      // Upload images first
      let imageUrls = [];
      if (selectedImages.length > 0) {
        try {
          imageUrls = await uploadImages();
        } catch (error) {
          setErrors({ general: 'Failed to upload images. Please try again.' });
          setLoading(false);
          return;
        }
      }
      
      const submitData = {
        ...formData,
        year: parseInt(formData.year),
        capacity: parseInt(formData.capacity),
        price: parseFloat(formData.price),
        mileage: formData.mileage ? parseInt(formData.mileage) : 0,
        images: imageUrls
      };

      // Only include availability for rental cars
      if (formData.listingType === 'rent') {
        submitData.availability = formData.availability;
      } else {
        delete submitData.availability;
      }

      const response = await fetch('http://localhost:5001/api/seller/cars', {
      const response = await fetch(API_ENDPOINTS.SELLER_CARS
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (response.ok) {
        alert('Car added successfully!');
        navigate('/seller/dashboard');
      } else {
        setErrors({ general: data.message || 'Failed to add car' });
      }
    } catch (error) {
      console.error('Error adding car:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1980 + 2 }, (_, i) => currentYear + 1 - i);

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
            <h1>Add New Car</h1>
            <p>Fill in the details to list your car</p>
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

            {/* Car Images */}
            <div className="form-section">
              <h3>Car Images</h3>
              <div className="form-group">
                <label htmlFor="images">Upload Car Images (Max 5 images)</label>
                <input
                  type="file"
                  id="images"
                  name="images"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  className={errors.images ? 'error' : ''}
                />
                {errors.images && <span className="error-text">{errors.images}</span>}
                <p className="form-help">
                  Supported formats: JPEG, PNG, WebP. Maximum size: 5MB per image.
                </p>
              </div>

              {/* Image Preview */}
              {imagePreview.length > 0 && (
                <div className="image-preview-container">
                  <h4>Image Preview</h4>
                  <div className="image-preview-grid">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="image-preview-item">
                        <img src={preview} alt={`Preview ${index + 1}`} />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => removeImage(index)}
                          title="Remove image"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                className={`btn btn-primary ${loading || uploadingImages ? 'loading' : ''}`}
                disabled={loading || uploadingImages}
              >
                {uploadingImages ? 'Uploading Images...' : loading ? 'Adding Car...' : 'Add Car'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCar;
