import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import car1 from './images/car1';
import car2 from './images/car2';
import car3 from './images/car3';
import Footer from './Components/Common/Footer';
import Navbar from './Components/Common/Navbar';

// Import SignIn and SignUp components
import SignIn from './Components/LoginDetails/SignIn';
import SignUp from './Components/LoginDetails/SignUp';

// Placeholder components if SignIn/SignUp don't exist yet
// SignIn and SignUp components are now imported from their respective files

// Custom hook for scroll animations
const useScrollAnimation = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [threshold]);

  return [elementRef, isVisible];
};

// Header extracted to Components/Common/Navbar.jsx

// Service Selection Component
const ServiceSelection = ({ onServiceSelect, onClose }) => {
  const services = [
    {
      id: 'rent',
      title: 'Rent a Car',
      description: 'Short-term rental for your travel needs',
      icon: 'fas fa-calendar-alt',
      color: '#2563eb'
    },
    {
      id: 'buy-new',
      title: 'Buy a New Car',
      description: 'Purchase brand new vehicles',
      icon: 'fas fa-car',
      color: '#059669'
    },
    {
      id: 'buy-used',
      title: 'Buy a Used Car',
      description: 'Quality pre-owned vehicles',
      icon: 'fas fa-car-side',
      color: '#dc2626'
    }
  ];

  return (
    <div className="service-selection">
      <h3 className="service-title">What are you looking for?</h3>
      <div className="service-options">
        {services.map((service) => (
          <div
            key={service.id}
            className="service-option"
            onClick={() => onServiceSelect(service.id)}
            style={{ borderColor: service.color }}
          >
            <div className="service-icon" style={{ color: service.color }}>
              <i className={service.icon}></i>
            </div>
            <h4>{service.title}</h4>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Search Form Component
const SearchForm = ({ onSearch, serviceType }) => {
  const [searchData, setSearchData] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    startDate: '',
    returnDate: '',
    carType: '',
    maxBudget: 100,
    passengers: 1,
    transmission: ''
  });

  const handleInputChange = (e) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value
    });
  };

  const handleBudgetChange = (e) => {
    setSearchData({
      ...searchData,
      maxBudget: parseInt(e.target.value)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Search data:', searchData);
    if (onSearch) {
      onSearch(searchData);
    }
  };

  const getFormTitle = () => {
    switch(serviceType) {
      case 'rent': return 'Find Your Rental Car';
      case 'buy-new': return 'Find Your New Car';
      case 'buy-used': return 'Find Your Used Car';
      default: return 'Find Your Perfect Car';
    }
  };

  const getFormFields = () => {
    if (serviceType === 'rent') {
      return (
        <>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pickupLocation">Pickup Location</label>
              <input
                type="text"
                id="pickupLocation"
                name="pickupLocation"
                placeholder="Enter pickup location"
                value={searchData.pickupLocation}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="dropoffLocation">Drop-off Location</label>
              <input
                type="text"
                id="dropoffLocation"
                name="dropoffLocation"
                placeholder="Enter drop-off location"
                value={searchData.dropoffLocation}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={searchData.startDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="returnDate">Return Date</label>
              <input
                type="date"
                id="returnDate"
                name="returnDate"
                value={searchData.returnDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </>
      );
    } else {
      return (
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="location">Your Location</label>
            <input
              type="text"
              id="location"
              name="location"
              placeholder="Enter your city"
              value={searchData.location || ''}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group budget-group">
            <label htmlFor="maxBudget">Maximum Budget: ${searchData.maxBudget * (serviceType === 'buy-new' ? 500 : serviceType === 'buy-used' ? 200 : 1)}{serviceType === 'rent' ? '/day' : ''}</label>
            <input
              type="range"
              id="maxBudget"
              name="maxBudget"
              min={serviceType === 'rent' ? "25" : "50"}
              max={serviceType === 'buy-new' ? "200" : serviceType === 'buy-used' ? "150" : "200"}
              value={searchData.maxBudget}
              onChange={handleBudgetChange}
              className="budget-slider"
            />
            <div className="budget-range">
              <span>${serviceType === 'rent' ? '25' : serviceType === 'buy-new' ? '25,000' : '10,000'}</span>
              <span>${serviceType === 'rent' ? '200' : serviceType === 'buy-new' ? '100,000' : '30,000'}</span>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <h3 className="booking-title">{getFormTitle()}</h3>
      
      {getFormFields()}
      

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="carType">Car Type</label>
          <select
            id="carType"
            name="carType"
            value={searchData.carType}
            onChange={handleInputChange}
          >
            <option value="">Any Type</option>
            <option value="economy">Economy</option>
            <option value="compact">Compact</option>
            <option value="midsize">Mid-size</option>
            <option value="luxury">Luxury</option>
            <option value="suv">SUV</option>
            <option value="electric">Electric</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="transmission">Transmission</label>
          <select
            id="transmission"
            name="transmission"
            value={searchData.transmission}
            onChange={handleInputChange}
          >
            <option value="">Any Transmission</option>
            <option value="automatic">Automatic</option>
            <option value="manual">Manual</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="passengers">Number of Passengers</label>
          <select
            id="passengers"
            name="passengers"
            value={searchData.passengers}
            onChange={handleInputChange}
          >
            <option value="1">1 Passenger</option>
            <option value="2">2 Passengers</option>
            <option value="4">4 Passengers</option>
            <option value="5">5 Passengers</option>
            <option value="7">7+ Passengers</option>
          </select>
        </div>
      </div>

      <button type="submit" className="search-btn">
        <i className="fas fa-search"></i> {serviceType === 'rent' ? 'Find Available Cars' : 'Search Cars'}
      </button>
    </form>
  );
};

// Hero Section Component
const Hero = ({ onSearch }) => {
  const [heroRef, isHeroVisible] = useScrollAnimation(0.2);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showServiceSelection, setShowServiceSelection] = useState(false);
  const images = [car1, car2, car3];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  const openModal = () => {
    setShowServiceSelection(true);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setShowServiceSelection(false);
    setSelectedService(null);
  };
  
  const handleServiceSelect = (serviceType) => {
    setSelectedService(serviceType);
    setShowServiceSelection(false);
    onSearch({ serviceType });
  };

  return (
    <section className={`hero ${isHeroVisible ? 'hero-animate' : ''}`} id="home" ref={heroRef}>
      <div className="hero-background">
        {images.map((image, index) => (
          <div
            key={index}
            className={`hero-bg-image ${index === currentImageIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
        <div className="hero-overlay"></div>
      </div>
      <div className="container">
        <div className="hero-content">
          <h1 className={`${isHeroVisible ? 'zoom-in' : ''}`}>Find Your Perfect Car</h1>
          <p className={`${isHeroVisible ? 'fade-in-up delay-2' : ''}`}>
            Book your ride in just a few clicks. We have the keys to your next adventure.
          </p>
          <div className={`${isHeroVisible ? 'slide-in-up delay-3' : ''}`}>
            <button className="btn btn-primary btn-lg pulse-glow" onClick={openModal}>
              Let's Go <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeModal}>
              <i className="fas fa-times"></i>
            </button>
            {showServiceSelection ? (
              <ServiceSelection onServiceSelect={handleServiceSelect} onClose={closeModal} />
            ) : (
              <SearchForm onSearch={onSearch} serviceType={selectedService} />
            )}
          </div>
        </div>
      )}
    </section>
  );
};

// Car Card Component
const CarCard = ({ car }) => {
  const formatPrice = (price, category) => {
    if (category === 'rent') {
      return `$${price}/day`;
    } else {
      return `$${price.toLocaleString()}`;
    }
  };

  const getButtonText = (category) => {
    switch(category) {
      case 'rent': return 'Book Now';
      case 'buy-new': return 'Buy New';
      case 'buy-used': return 'Buy Used';
      default: return 'View Details';
    }
  };

  return (
    <div className="car-card">
      <div className="car-image">
        <i className={car.icon}></i>
      </div>
      <div className="car-info">
        <h3 className="car-name">{car.name}</h3>
        <div className="car-features">
          <span><i className="fas fa-users"></i> {car.seats} seats</span>
          <span><i className="fas fa-cog"></i> {car.transmission}</span>
          <span><i className="fas fa-gas-pump"></i> {car.fuel}</span>
        </div>
        <div className="car-price">
          {formatPrice(car.price, car.category)}
        </div>
        <button className="btn btn-primary" style={{width: '100%'}}>
          {getButtonText(car.category)}
        </button>
      </div>
    </div>
  );
};

// Featured Cars Section
const FeaturedCars = ({ searchCriteria }) => {
  const [sectionRef, isVisible] = useScrollAnimation(0.1);

  const rentalCars = [
    {
      id: 1,
      name: "Toyota Camry",
      seats: 5,
      transmission: "automatic",
      fuel: "Petrol",
      price: 45,
      icon: "fas fa-car",
      type: "midsize",
      category: "rent"
    },
    {
      id: 2,
      name: "BMW X5",
      seats: 7,
      transmission: "automatic",
      fuel: "Petrol",
      price: 89,
      icon: "fas fa-car-side",
      type: "suv",
      category: "rent"
    },
    {
      id: 3,
      name: "Mercedes C-Class",
      seats: 5,
      transmission: "automatic",
      fuel: "Petrol",
      price: 75,
      icon: "fas fa-car",
      type: "luxury",
      category: "rent"
    },
    {
      id: 4,
      name: "Honda CR-V",
      seats: 5,
      transmission: "automatic",
      fuel: "Hybrid",
      price: 55,
      icon: "fas fa-car-side",
      type: "suv",
      category: "rent"
    },
    {
      id: 5,
      name: "Audi A4",
      seats: 5,
      transmission: "automatic",
      fuel: "Petrol",
      price: 68,
      icon: "fas fa-car",
      type: "luxury",
      category: "rent"
    }
  ];

  const newCars = [
    {
      id: 11,
      name: "2024 Tesla Model S",
      seats: 5,
      transmission: "automatic",
      fuel: "Electric",
      price: 95000,
      icon: "fas fa-car",
      type: "luxury",
      category: "buy-new"
    },
    {
      id: 12,
      name: "2024 BMW 3 Series",
      seats: 5,
      transmission: "automatic",
      fuel: "Petrol",
      price: 45000,
      icon: "fas fa-car",
      type: "luxury",
      category: "buy-new"
    },
    {
      id: 13,
      name: "2024 Toyota Prius",
      seats: 5,
      transmission: "automatic",
      fuel: "Hybrid",
      price: 28000,
      icon: "fas fa-car",
      type: "compact",
      category: "buy-new"
    },
    {
      id: 14,
      name: "2024 Ford F-150",
      seats: 5,
      transmission: "automatic",
      fuel: "Petrol",
      price: 55000,
      icon: "fas fa-truck",
      type: "truck",
      category: "buy-new"
    },
    {
      id: 15,
      name: "2024 Honda Accord",
      seats: 5,
      transmission: "automatic",
      fuel: "Petrol",
      price: 32000,
      icon: "fas fa-car",
      type: "midsize",
      category: "buy-new"
    }
  ];

  const usedCars = [
    {
      id: 16,
      name: "2019 Toyota Corolla",
      seats: 5,
      transmission: "automatic",
      fuel: "Petrol",
      price: 18000,
      icon: "fas fa-car",
      type: "compact",
      category: "buy-used"
    },
    {
      id: 17,
      name: "2018 Honda Civic",
      seats: 5,
      transmission: "manual",
      fuel: "Petrol",
      price: 16000,
      icon: "fas fa-car",
      type: "compact",
      category: "buy-used"
    },
    {
      id: 18,
      name: "2020 Nissan Altima",
      seats: 5,
      transmission: "automatic",
      fuel: "Petrol",
      price: 22000,
      icon: "fas fa-car",
      type: "midsize",
      category: "buy-used"
    },
    {
      id: 19,
      name: "2017 BMW X3",
      seats: 5,
      transmission: "automatic",
      fuel: "Petrol",
      price: 28000,
      icon: "fas fa-car-side",
      type: "suv",
      category: "buy-used"
    },
    {
      id: 20,
      name: "2019 Ford Escape",
      seats: 5,
      transmission: "automatic",
      fuel: "Petrol",
      price: 20000,
      icon: "fas fa-car-side",
      type: "suv",
      category: "buy-used"
    }
  ];

  // Get cars based on service type
  const getAllCars = () => {
    return [...rentalCars, ...newCars, ...usedCars];
  };

  const getCarsByService = (serviceType) => {
    switch(serviceType) {
      case 'rent': return rentalCars;
      case 'buy-new': return newCars;
      case 'buy-used': return usedCars;
      default: return getAllCars();
    }
  };

  // Filter cars based on search criteria
  const filterCars = (cars, criteria) => {
    if (!criteria) return cars;

    return cars.filter(car => {
      // Filter by car type
      if (criteria.carType && car.type !== criteria.carType) return false;
      
      // Filter by transmission
      if (criteria.transmission && car.transmission !== criteria.transmission) return false;
      
      // Filter by passenger count
      if (criteria.passengers && car.seats < parseInt(criteria.passengers)) return false;
      
      // Filter by budget
      if (criteria.maxBudget) {
        const budgetMultiplier = criteria.serviceType === 'buy-new' ? 500 : criteria.serviceType === 'buy-used' ? 200 : 1;
        if (car.price > criteria.maxBudget * budgetMultiplier) return false;
      }
      
      return true;
    });
  };

  const serviceType = searchCriteria?.serviceType;
  const availableCars = getCarsByService(serviceType);
  const cars = filterCars(availableCars, searchCriteria);

  return (
    <section className={`featured-cars ${isVisible ? 'animate-in' : ''}`} id="cars" ref={sectionRef}>
      <div className="container">
        <h2 className={`section-title ${isVisible ? 'fade-in-up' : ''}`}>
          {serviceType === 'rent' ? 'Available Rental Cars' : 
           serviceType === 'buy-new' ? 'New Cars for Sale' :
           serviceType === 'buy-used' ? 'Used Cars for Sale' : 'Featured Cars'}
        </h2>
        <p className={`section-subtitle ${isVisible ? 'fade-in-up delay-1' : ''}`}>
          {searchCriteria ? `Found ${cars.length} cars matching your criteria` : 'Choose from our premium selection of well-maintained vehicles'}
        </p>
        <div className="cars-grid">
          {cars.length > 0 ? (
            cars.map((car, index) => (
              <div key={car.id} className={`car-card-wrapper ${isVisible ? 'slide-in-up' : ''}`} style={{animationDelay: `${0.2 + index * 0.1}s`}}>
                <CarCard car={car} />
              </div>
            ))
          ) : (
            <div className="no-cars-message">
              <i className="fas fa-search" style={{fontSize: '3rem', color: '#6b7280', marginBottom: '1rem'}}></i>
              <h3>No cars found matching your criteria</h3>
              <p>Try adjusting your search filters to see more options</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// Services Section
const Services = () => {
  const [servicesRef, isServicesVisible] = useScrollAnimation(0.1);
  
  const services = [
    {
      id: 1,
      icon: "fas fa-shield-alt",
      title: "Full Insurance",
      description: "Comprehensive coverage for complete peace of mind during your rental period."
    },
    {
      id: 2,
      icon: "fas fa-clock",
      title: "24/7 Support",
      description: "Round-the-clock customer service to assist you whenever you need help."
    },
    {
      id: 3,
      icon: "fas fa-map-marked-alt",
      title: "GPS Navigation",
      description: "All our vehicles come equipped with modern GPS navigation systems."
    },
    {
      id: 4,
      icon: "fas fa-tools",
      title: "Free Maintenance",
      description: "Regular maintenance and roadside assistance included in every rental."
    }
  ];

  return (
    <section className={`services ${isServicesVisible ? 'animate-in' : ''}`} id="services" ref={servicesRef}>
      <div className="container">
        <h2 className={`section-title ${isServicesVisible ? 'bounce-in' : ''}`}>Why Choose CarCraze?</h2>
        <p className={`section-subtitle ${isServicesVisible ? 'fade-in-up delay-1' : ''}`}>
          We provide exceptional service and value for all your car rental needs
        </p>
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={service.id} className={`service-card ${isServicesVisible ? 'flip-in' : ''}`} style={{animationDelay: `${0.3 + index * 0.2}s`}}>
              <div className={`service-icon ${isServicesVisible ? 'pulse-glow' : ''}`} style={{animationDelay: `${0.5 + index * 0.2}s`}}>
                <i className={service.icon}></i>
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Footer component is now imported from './Components/Common/Footer'

// Home Page Component
const HomePage = () => {
  const [searchCriteria, setSearchCriteria] = useState(null);

  const handleSearch = (criteria) => {
    setSearchCriteria(criteria);
    // Scroll to featured cars section
    document.getElementById('cars').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="home-page">
      <Navbar />
      <Hero onSearch={handleSearch} />
      <FeaturedCars searchCriteria={searchCriteria} />
      <Services />
      <Footer />
    </div>
  );
};

// Main App Component with Routing
function AppwithRouter() {
  const navigate = useNavigate();

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={
          <div className="auth-page">
            <SignIn onSwitchToSignUp={() => navigate('/signup')} />
          </div>
        } />
        <Route path="/signup" element={
          <div className="auth-page">
            <SignUp onSwitchToSignIn={() => navigate('/signin')} />
          </div>
        } />
      </Routes>
    </div>
  );
}

// Root App Component with Router
function App() {
  return (
    <Router>
      <AppwithRouter />
    </Router>
  );
}

export default App;
