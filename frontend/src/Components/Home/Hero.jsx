import { useState, useEffect } from 'react';
import useScrollAnimation from '../../Hooks/useScrollAnimation';
import ServiceSelection from './ServiceSelection';
import SearchForm from './SearchForm';
import car1 from '../../images/car1';
import car2 from '../../images/car2';
import car3 from '../../images/car3';

const Hero = ({ onSearch, onLetsGo, user }) => {
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
    <section 
      ref={heroRef} 
      id="home" 
      className="relative min-h-[85vh] lg:min-h-[80vh] flex items-center justify-center pt-24 pb-16 overflow-hidden"
    >
      {/* Background Slideshow */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-start justify-center">
        <div className="max-w-2xl text-left">
          
          <h1 className={`text-5xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6 drop-shadow-md transform transition-all duration-1000 ease-out ${isHeroVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            {user && user.role === 'seller' 
              ? `Welcome ${user.firstName}!` 
              : 'Find Your Perfect Car'
            }
          </h1>
          
          <p className={`text-lg sm:text-xl text-gray-200 mb-10 leading-relaxed drop-shadow-sm font-medium transform transition-all duration-1000 delay-200 ease-out ${isHeroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {user && user.role === 'seller'
              ? 'Manage your car inventory and grow your business with CarCraze.'
              : 'Book your ride in just a few clicks. We have the keys to your next adventure.'
            }
          </p>
          
          <div className={`transform transition-all duration-1000 delay-300 ease-out ${isHeroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <button
              className="group relative px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-full overflow-hidden transition-all duration-300 hover:bg-blue-700 hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] focus:outline-none focus:ring-4 focus:ring-blue-500/50"
              onClick={() => {
                if (typeof onLetsGo === 'function') {
                  onLetsGo();
                } else {
                  openModal();
                }
              }}
            >
              {/* Subtle pulse ring behind button text */}
              <span className="absolute inset-0 w-full h-full rounded-full bg-blue-400 opacity-0 group-hover:animate-ping"></span>
              
              <span className="relative flex items-center justify-center gap-2">
                {user && user.role === 'seller' 
                  ? <>Manage Inventory <i className="fas fa-car ml-1 transition-transform group-hover:translate-x-1"></i></>
                  : <>Let's Go <i className="fas fa-arrow-right ml-1 transition-transform group-hover:translate-x-1"></i></>
                }
              </span>
            </button>
          </div>
          
        </div>
      </div>

      {/* Modal Overlay & Content */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]" 
          onClick={closeModal}
        >
          <div 
            className="relative bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-[slideUp_0.3s_ease-out]" 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 w-10 h-10 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center hover:bg-gray-200 hover:text-gray-800 transition-colors focus:outline-none" 
              onClick={closeModal}
              aria-label="Close modal"
            >
              <i className="fas fa-times text-lg"></i>
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