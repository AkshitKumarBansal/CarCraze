import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SellerDashboard.css';
import Navbar from '../Common/Navbar';
import Hero from '../Home/Hero';
import newCarsImage from '../../images/NewCars.png';
import oldCarsImage from '../../images/OldCars.png';
import rentCarsImage from '../../images/RentalCars.png';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  // Helper function to fix image URLs with correct port
  const fixImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    // Replace any localhost port with the current server port
    return imageUrl.replace(/localhost:\d+/, 'localhost:5000');
  };

  // Choose an image for a car: prefer backend URL, else use a local placeholder
  const getCarImage = (car) => {
    const first = Array.isArray(car?.images) && car.images[0] ? fixImageUrl(car.images[0]) : null;
    if (first) return first;
    if (car?.listingType === 'sale_old') return oldCarsImage;
    if (car?.listingType === 'rent') return rentCarsImage;
    return newCarsImage;
  };

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

    setUser(parsedUser);
    fetchSellerCars();
  }, [navigate]);

  const fetchSellerCars = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/seller/cars', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCars(data.cars);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch cars');
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCar = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this car?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/seller/cars/${carId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setCars(cars.filter(car => car.id !== carId));
        alert('Car deleted successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to delete car');
      }
    } catch (error) {
      console.error('Error deleting car:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const formatPrice = (price, listingType) => {
    if (listingType === 'rent') {
      return `$${price}/day`;
    }
    return `$${price.toLocaleString()}`;
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'status-badge active',
      inactive: 'status-badge inactive',
      sold: 'status-badge sold'
    };
    return statusClasses[status] || 'status-badge';
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Navbar />
        <Hero onSearch={() => { /* no-op for seller dashboard */ }} />
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Navbar />
      <Hero onSearch={() => { /* no-op for seller dashboard */ }} user={user} />
      
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <div className="header-actions">
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/seller/add-car')}
              >
                <i className="fas fa-plus"></i> Add New Car
              </button>
              <button 
                className="btn btn-secondary"
                onClick={handleLogout}
              >
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="dashboard-stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-car"></i>
              </div>
              <div className="stat-content">
                <h3>{cars.length}</h3>
                <p>Total Cars</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-eye"></i>
              </div>
              <div className="stat-content">
                <h3>{cars.filter(car => car.status === 'active').length}</h3>
                <p>Active Listings</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-handshake"></i>
              </div>
              <div className="stat-content">
                <h3>{cars.filter(car => car.listingType === 'rent').length}</h3>
                <p>For Rent</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-dollar-sign"></i>
              </div>
              <div className="stat-content">
                <h3>{cars.filter(car => car.listingType === 'sale_new' || car.listingType === 'sale_old').length}</h3>
                <p>For Sale</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cars Inventory */}
      <div className="dashboard-content">
        <div className="container">
          <div className="section-header">
            <h2>Your Car Inventory</h2>
            <p>Manage all your listed cars</p>
          </div>

          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          {cars.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="fas fa-car"></i>
              </div>
              <h3>No cars listed yet</h3>
              <p>Start by adding your first car to the inventory</p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/seller/add-car')}
              >
                <i className="fas fa-plus"></i> Add Your First Car
              </button>
            </div>
          ) : (
            <div className="cars-grid">
              {cars.map((car) => (
                <div key={car.id} className="car-card">
                  <div className="car-image-container">
                    <img
                      src={getCarImage(car)}
                      alt={`${car.brand} ${car.model}`}
                      className="car-image"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getCarImage({ listingType: car.listingType, images: [] });
                      }}
                    />
                    <span className={getStatusBadge(car.status)}>
                      {car.status}
                    </span>
                    {car.images && car.images.length > 1 && (
                      <div className="image-count">
                        <i className="fas fa-images"></i>
                        {car.images.length}
                      </div>
                    )}
                  </div>
                  
                  <div className="car-details">
                    <div className="car-header">
                      <h3>{car.year} {car.brand} {car.model}</h3>
                      <div className="listing-type">
                        <span className={`type-badge ${car.listingType}`}>
                          {car.listingType === 'rent' ? 'For Rent' : 
                           car.listingType === 'sale_new' ? 'For Sale (New)' : 
                           car.listingType === 'sale_old' ? 'For Sale (Used)' : 'For Sale'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="car-specs">
                      <div className="spec">
                        <i className="fas fa-users"></i>
                        <span>{car.capacity} seats</span>
                      </div>
                      <div className="spec">
                        <i className="fas fa-cog"></i>
                        <span>{car.transmission}</span>
                      </div>
                      <div className="spec">
                        <i className="fas fa-gas-pump"></i>
                        <span>{car.fuelType}</span>
                      </div>
                    </div>

                    {car.description && (
                      <p className="car-description">{car.description}</p>
                    )}

                    {car.listingType === 'rent' && car.availability && (
                      <div className="availability">
                        <i className="fas fa-calendar-alt"></i>
                        <span>Available: {car.availability.startDate} to {car.availability.endDate}</span>
                      </div>
                    )}

                    <div className="car-footer">
                      <div className="price">
                        {formatPrice(car.price, car.listingType)}
                      </div>
                      <div className="car-actions">
                        <button 
                          className="btn btn-sm btn-outline"
                          onClick={() => navigate(`/seller/edit-car/${car.id}`)}
                        >
                          <i className="fas fa-edit"></i> Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteCar(car.id)}
                        >
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </div>
                    </div>

                    <div className="car-meta">
                      <small>Added: {new Date(car.createdAt).toLocaleDateString()}</small>
                      {car.updatedAt !== car.createdAt && (
                        <small>Updated: {new Date(car.updatedAt).toLocaleDateString()}</small>
                      )}
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

export default SellerDashboard;
