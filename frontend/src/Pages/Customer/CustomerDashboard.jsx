import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../Hooks/useToast';
import Hero from '../../Components/Home/Hero';
import Service from '../Public/Service';
import ImageModal from '../../Components/Common/ImageModal';
import WishlistButton from '../../Components/Common/WishlistButton';
import CompareButton from '../../Components/Common/CompareButton';

// TODO: Replace these with proper imports from your assets folder if available
const newCarsImage = '/images/placeholder-new.png';
const oldCarsImage = '/images/placeholder-old.png';
const rentCarsImage = '/images/placeholder-rent.png';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showImage, setShowImage] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(API_ENDPOINTS.CARS);
        if (!res.ok) throw new Error(`Failed to fetch cars: ${res.status}`);
        const data = await res.json();
        setCars(Array.isArray(data?.cars) ? data.cars.slice(0, 9) : []);
      } catch (err) {
        console.error('Error fetching cars:', err);
        setError('Unable to load car catalog. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  // Robust fallback for image errors: use local placeholders instead of a missing public asset
  const handleImageError = (e) => {
    e.currentTarget.onerror = null; // prevent infinite loop
    e.currentTarget.src = newCarsImage;
  };

  const getCarImage = (car) => {
    const first = Array.isArray(car?.images) && car.images[0] ? car.images[0] : null;
    if (first) return first;
    // choose placeholder by listing type
    if (car?.listingType === 'sale_old') return oldCarsImage;
    if (car?.listingType === 'rent') return rentCarsImage;
    return newCarsImage;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-[4.5rem]">
      <Hero
        onLetsGo={() => {
          const el = document.getElementById('catalog');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          else window.location.hash = 'catalog';
        }}
        onSearch={({ serviceType }) => {
          if (serviceType === 'rent') {
            navigate('/rent-cars');
          } else if (serviceType === 'buy-new') {
            navigate('/new-cars');
          } else if (serviceType === 'buy-used') {
            navigate('/old-cars');
          } else {
            // Fallback: scroll to catalog on the dashboard
            window.location.hash = 'catalog';
          }
        }}
      />
      
      <p className="text-center text-xl text-gray-500 font-medium py-8 px-4">
        Explore our services or manage your account.
      </p>
      
      {/* Reuse the Home Service section for consistent UI (buyer view) */}
      <Service mode="buyer" />

      {/* Catalog Section */}
      <div id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12 text-center relative pb-4 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-20 after:h-1 after:bg-gradient-to-r after:from-blue-600 after:to-purple-600 after:rounded-full">
          Car Catalog
        </h2>
        
        {loading && <div className="text-center py-12 text-gray-500 font-medium text-lg animate-pulse">Loading cars...</div>}
        {error && !loading && <div className="text-center py-12 text-red-500 bg-red-50 rounded-xl border border-red-100">{error}</div>}
        
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
            {cars.map((car) => (
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group" key={car._id || car.id}>
                
                {/* Car image */}
                <div className="relative h-56 bg-gray-100 overflow-hidden cursor-zoom-in">
                  <img
                    src={getCarImage(car)}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onClick={() => { setImageSrc(getCarImage(car)); setShowImage(true); }}
                    onError={handleImageError}
                  />
                  {car.images && car.images.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1.5 rounded-md flex items-center gap-1.5 z-10">
                      <i className="fas fa-images"></i>
                      {car.images.length}
                    </div>
                  )}
                  <div className="absolute top-3 right-3 z-10">
                    <WishlistButton carId={car._id || car.id} size="sm" />
                  </div>
                </div>

                {/* Car details */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-gray-500 text-xs uppercase tracking-wider">{car.brand}</span>
                    <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{car.year}</span>
                  </div>
                  
                  <div className="text-2xl font-bold text-gray-900 mb-4 line-clamp-1">{car.model}</div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-md">{car.fuelType}</span>
                    <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-md">{car.transmission}</span>
                    <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-md">{car.capacity} Seats</span>
                  </div>
                  
                  <div className="text-sm text-gray-500 line-clamp-2 mb-6 flex-1" title={car.description}>
                    {car.description}
                  </div>
                  
                  {/* Card Footer */}
                  <div className="pt-5 border-t border-gray-100 flex flex-col gap-4 mt-auto">
                    <span className="text-2xl font-extrabold text-gray-900">
                      {car.listingType === 'rent' ? `₹${car.price.toLocaleString('en-IN')}` : `₹${car.price.toLocaleString('en-IN')}`}
                      {car.listingType === 'rent' && <span className="text-sm text-gray-500 font-medium"> /day</span>}
                    </span>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-bold rounded-xl transition-colors text-center"
                        onClick={() => navigate(`/cars/${car._id || car.id}`)}
                      >
                        View Details
                      </button>
                      <button
                        className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm text-center"
                        onClick={async () => {
                          if (car.listingType === 'rent') {
                            toast.info('📅 Please select pickup and return dates first!');
                            navigate('/rent-cars');
                            return;
                          }
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
      
      {showImage && (
        <ImageModal src={imageSrc} alt="Car image" onClose={() => setShowImage(false)} />
      )}
    </div>
  );
};

export default CustomerDashboard;