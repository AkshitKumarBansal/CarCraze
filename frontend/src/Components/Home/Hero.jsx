import { useState, useEffect } from 'react';
import useScrollAnimation from '../../Hooks/useScrollAnimation';
import ServiceSelection from './ServiceSelection';
import SearchForm from './SearchForm';
import car1 from '../../images/car1';
import car2 from '../../images/car2';
import car3 from '../../images/car3';
import '/src/index.css';


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

export default Hero;
