import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../Hooks/useToast';
import { API_ENDPOINTS } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../Components/Layout/Navbar';
import Hero from '../../Components/Home/Hero';
import ImageModal from '../../Components/Common/ImageModal';
import newCarsImage from '../../images/NewCars.png';
import oldCarsImage from '../../images/OldCars.png';
import rentCarsImage from '../../images/RentalCars.png';

const SellerDashboard = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const { user, authLoading, logout: authLogout } = useAuth();

    const [cars, setCars] = useState([]);
    const [carsLoading, setCarsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showImage, setShowImage] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);

    useEffect(() => {
        if (authLoading) {
            return; // Wait for auth context to initialize
        }
        if (!user) {
            navigate('/signin');
            return;
        }
        if (user.role !== 'seller') {
            navigate('/');
            return;
        }

        fetchSellerCars();
    }, [user, authLoading, navigate]);

    const fetchSellerCars = async () => {
        setCarsLoading(true);
        try {
            const response = await fetch(API_ENDPOINTS.SELLER_CARS, {
                credentials: 'include',
                headers: {
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
            setCarsLoading(false);
        }
    };

    const handleDeleteCar = async (carId) => {
        if (!window.confirm('Are you sure you want to delete this car? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`${API_ENDPOINTS.SELLER_CARS}/${carId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setCars(cars.filter(car => car._id !== carId));
                toast.success('Car deleted successfully!');
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || 'Failed to delete car');
            }
        } catch (error) {
            console.error('Error deleting car:', error);
            toast.error('Network error. Please try again.');
        }
    };

    const handleLogout = async () => {
        // Use the logout function from AuthContext
        await authLogout();
        navigate('/');
    };

    const formatPrice = (price, listingType) => {
        if (listingType === 'rent') {
            return `₹${price}/day`;
        }
        return `₹${price.toLocaleString('en-IN')}`;
    };

    const getStatusBadge = (status) => {
        const baseClasses = "absolute top-4 right-4 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm z-10 bg-white/90";
        const statusClasses = {
            active: 'text-emerald-600 border border-emerald-200',
            inactive: 'text-gray-600 border border-gray-200',
            sold: 'text-red-600 border border-red-200'
        };
        return `${baseClasses} ${statusClasses[status] || statusClasses.inactive}`;
    };

    const getTypeBadgeClass = (type) => {
        const baseClasses = "px-3 py-1.5 rounded-md text-xs font-semibold text-white backdrop-blur-sm bg-gray-900/85";
        const typeClasses = {
            rent: 'bg-blue-500/90',
            sale_new: 'bg-emerald-500/90',
            sale_old: 'bg-amber-500/90'
        };
        return `${baseClasses} ${typeClasses[type] || ''}`;
    };

    const getCarImage = (car) => {
        const first = Array.isArray(car?.images) && car.images[0] ? car.images[0] : null;
        if (first) return first;
        // choose placeholder by listing type
        if (car?.listingType === 'sale_old') return oldCarsImage;
        if (car?.listingType === 'rent') return rentCarsImage;
        return newCarsImage;
    };

    const inventoryRef = React.useRef(null);

    const scrollToInventory = () => {
        inventoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (authLoading || carsLoading) {
        return (
            <div className="min-h-screen bg-gray-100 pb-16 font-sans text-gray-800">
                <Navbar isLoggedIn={true} setIsLoggedIn={() => { }} />
                <Hero onSearch={() => { /* no-op for seller dashboard */ }} />
                <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                    <p className="font-medium text-lg">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 pb-16 font-sans text-gray-800">
            <Navbar isLoggedIn={true} setIsLoggedIn={() => { }} />
            <Hero
                onSearch={() => { /* no-op for seller dashboard */ }}
                user={user}
                onLetsGo={scrollToInventory}
            />
            {/* Dashboard Header */}
            <div className="bg-white py-6 border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-end items-center flex-wrap gap-4">
                        <div className="flex gap-4 w-full sm:w-auto">
                            <button
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-[0.95rem] transition-all bg-indigo-600 text-white shadow-md hover:bg-indigo-700 hover:-translate-y-px border-none cursor-pointer"
                                onClick={() => navigate('/seller/add-car')}
                            >
                                <i className="fas fa-plus text-lg"></i> Add New Car
                            </button>
                            <button
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-[0.95rem] transition-all bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 cursor-pointer"
                                onClick={() => navigate('/profile')}
                            >
                                <i className="fas fa-user-edit text-lg"></i> Edit Profile
                            </button>
                            <button
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-[0.95rem] transition-all bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 cursor-pointer"
                                onClick={handleLogout}
                            >
                                <i className="fas fa-sign-out-alt text-lg"></i> Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Stats */}
            <div className="py-8">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 flex items-center gap-5 transition-transform hover:-translate-y-0.5 shadow-sm hover:shadow-md">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl bg-indigo-50 text-indigo-600">
                                <i className="fas fa-car"></i>
                            </div>
                            <div>
                                <h3 className="text-[1.875rem] font-bold leading-none mb-1 text-gray-900">{cars.length}</h3>
                                <p className="text-gray-500 text-sm font-medium m-0">Total Cars</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 flex items-center gap-5 transition-transform hover:-translate-y-0.5 shadow-sm hover:shadow-md">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl bg-emerald-50 text-emerald-600">
                                <i className="fas fa-eye"></i>
                            </div>
                            <div>
                                <h3 className="text-[1.875rem] font-bold leading-none mb-1 text-gray-900">{cars.filter(car => car.status === 'active').length}</h3>
                                <p className="text-gray-500 text-sm font-medium m-0">Active Listings</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 flex items-center gap-5 transition-transform hover:-translate-y-0.5 shadow-sm hover:shadow-md">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl bg-orange-50 text-orange-600">
                                <i className="fas fa-handshake"></i>
                            </div>
                            <div>
                                <h3 className="text-[1.875rem] font-bold leading-none mb-1 text-gray-900">{cars.filter(car => car.listingType === 'rent').length}</h3>
                                <p className="text-gray-500 text-sm font-medium m-0">For Rent</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 flex items-center gap-5 transition-transform hover:-translate-y-0.5 shadow-sm hover:shadow-md">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl bg-red-50 text-red-600">
                                <i className="fas fa-dollar-sign"></i>
                            </div>
                            <div>
                                <h3 className="text-[1.875rem] font-bold leading-none mb-1 text-gray-900">{cars.filter(car => car.listingType === 'sale_new' || car.listingType === 'sale_old').length}</h3>
                                <p className="text-gray-500 text-sm font-medium m-0">For Sale</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cars Inventory */}
            <div ref={inventoryRef}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-end mb-8 pb-4 border-b-2 border-gray-200">
                        <div>
                            <h2 className="text-[1.75rem] font-bold text-gray-900 m-0">Your Car Inventory</h2>
                            <p className="text-gray-500 mt-1 m-0">Manage all your listed cars</p>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-3 border border-red-200 font-medium">
                            <i className="fas fa-exclamation-triangle"></i>
                            {error}
                        </div>
                    )}

                    {cars.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                            <div className="text-5xl text-gray-300 mb-4">
                                <i className="fas fa-car"></i>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2 m-0">No cars listed yet</h3>
                            <p className="text-gray-500 mb-6 m-0">Start by adding your first car to the inventory</p>
                            <button
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-colors border-none cursor-pointer"
                                onClick={() => navigate('/seller/add-car')}
                            >
                                <i className="fas fa-plus"></i> Add Your First Car
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {cars.map((car) => (
                                <div key={car._id || car.id} className="bg-white rounded-2xl overflow-hidden border border-gray-200 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-gray-300 group">
                                    <div className="h-[240px] relative bg-gray-100 overflow-hidden">
                                        <img
                                            src={getCarImage(car)}
                                            alt={`${car.brand} ${car.model}`}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            onClick={() => { setImageSrc(getCarImage(car)); setShowImage(true); }}
                                            style={{ cursor: 'zoom-in' }}
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = getCarImage({ listingType: car.listingType, images: [] });
                                            }}
                                        />
                                        <div className="absolute bottom-4 left-4 z-10">
                                            <span className={getTypeBadgeClass(car.listingType)}>
                                                {car.listingType === 'rent' ? 'Rent' :
                                                    car.listingType === 'sale_new' ? 'New' :
                                                        car.listingType === 'sale_old' ? 'Used' : 'Sale'}
                                            </span>
                                        </div>
                                        <span className={getStatusBadge(car.status)}>
                                            {car.status}
                                        </span>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="mb-4">
                                            <h3 className="text-xl font-bold text-gray-900 leading-snug m-0 mb-2 line-clamp-2">{car.year} {car.brand} {car.model}</h3>
                                        </div>

                                        <div className="flex gap-5 mb-5 pb-5 border-b border-gray-100">
                                            <div className="flex items-center gap-2 text-gray-600 text-sm font-medium" title="Capacity">
                                                <i className="fas fa-users text-gray-400"></i>
                                                <span>{car.capacity}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600 text-sm font-medium" title="Transmission">
                                                <i className="fas fa-cog text-gray-400"></i>
                                                <span>{car.transmission}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600 text-sm font-medium" title="Fuel Type">
                                                <i className="fas fa-gas-pump text-gray-400"></i>
                                                <span>{car.fuelType}</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto flex items-center justify-between mb-4">
                                            <div className="text-2xl font-extrabold text-indigo-600">
                                                {formatPrice(car.price, car.listingType)}
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 cursor-pointer transition-colors hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50"
                                                    onClick={() => navigate(`/seller/edit-car/${car._id || car.id}`)}
                                                    title="Edit"
                                                >
                                                    <i className="fas fa-pencil-alt"></i>
                                                </button>
                                                <button
                                                    className="px-4 py-2 rounded-lg text-sm font-medium border border-red-200 bg-white text-red-600 cursor-pointer transition-colors hover:bg-red-50 hover:border-red-600"
                                                    onClick={() => handleDeleteCar(car._id || car.id)}
                                                    title="Delete"
                                                >
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center text-xs text-gray-400 font-medium">
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
            {
                showImage && (
                    <ImageModal src={imageSrc} alt="Car image" onClose={() => setShowImage(false)} />
                )
            }
        </div >
    );
};

export default SellerDashboard;