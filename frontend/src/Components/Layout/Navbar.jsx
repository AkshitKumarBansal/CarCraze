import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { Bars3Icon, BellIcon, XMarkIcon, HomeIcon, TruckIcon, InformationCircleIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';

const Navbar = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const userRole = user?.role ?? null;
  const [cartCount, setCartCount] = useState(0);
  const { wishlistCount } = useWishlist();

  // Fetch cart count for customers whenever the user changes
  useEffect(() => {
    if (user?.role !== 'customer') {
      setCartCount(0);
      return;
    }
    const fetchCartCount = async () => {
      try {
        const cartRes = await fetch(API_ENDPOINTS.CART, { credentials: 'include' });
        if (cartRes.ok) {
          const cartData = await cartRes.json();
          setCartCount(Array.isArray(cartData.items) ? cartData.items.length : 0);
        }
      } catch { /* silently ignore */ }
    };
    fetchCartCount();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <Disclosure as="nav" className="fixed top-0 left-0 right-0 z-[1000] bg-white/95 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.08)] border-b border-blue-500/10">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          
          {/* Mobile Menu Button */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="block h-6 w-6 group-data-[open]:hidden" aria-hidden="true" />
              <XMarkIcon className="hidden h-6 w-6 group-data-[open]:block" aria-hidden="true" />
            </DisclosureButton>
          </div>

          {/* Logo */}
          <div className="flex items-center ml-12 sm:ml-0">
            <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold text-gray-900 tracking-tight hover:opacity-90 transition-opacity">
              <span className="text-3xl">🚗</span>
              CarCraze
            </Link>
          </div>

          {/* Nav Links (Desktop) */}
          <ul className="hidden sm:flex items-center gap-8 lg:gap-10">
            <li>
              <Link
                to={isLoggedIn && userRole === 'customer' ? "/dashboard" : "/#home"}
                className="relative font-semibold text-gray-600 text-sm py-2 transition-colors hover:text-blue-600 after:absolute after:left-0 after:bottom-0 after:h-[3px] after:w-0 after:rounded-full after:bg-gradient-to-r after:from-blue-500 after:to-blue-700 after:transition-all after:duration-300 hover:after:w-full"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to={isLoggedIn && userRole === 'customer' ? "/dashboard#catalog" : "/#cars"}
                className="relative font-semibold text-gray-600 text-sm py-2 transition-colors hover:text-blue-600 after:absolute after:left-0 after:bottom-0 after:h-[3px] after:w-0 after:rounded-full after:bg-gradient-to-r after:from-blue-500 after:to-blue-700 after:transition-all after:duration-300 hover:after:w-full"
              >
                Cars
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="relative font-semibold text-gray-600 text-sm py-2 transition-colors hover:text-blue-600 after:absolute after:left-0 after:bottom-0 after:h-[3px] after:w-0 after:rounded-full after:bg-gradient-to-r after:from-blue-500 after:to-blue-700 after:transition-all after:duration-300 hover:after:w-full"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="relative font-semibold text-gray-600 text-sm py-2 transition-colors hover:text-blue-600 after:absolute after:left-0 after:bottom-0 after:h-[3px] after:w-0 after:rounded-full after:bg-gradient-to-r after:from-blue-500 after:to-blue-700 after:transition-all after:duration-300 hover:after:w-full"
              >
                Contact
              </Link>
            </li>
          </ul>

          <div className="hidden sm:flex items-center gap-4">
            {/* Location & Notifications */}
            {user && (
              <>
                <button type="button" className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  <MapPinIcon className="h-5 w-5" />
                  <span>Delhi</span>
                </button>
                <button type="button" className="relative rounded-full p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Auth Buttons / Profile Dropdown */}
            {!user ? (
              <div className="flex items-center gap-3">
                <Link to="/signin" className="text-gray-700 font-semibold hover:text-blue-600 px-4 py-2 transition-colors">
                  Sign In
                </Link>
                <Link to="/signup" className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="relative group">
                <div className="flex items-center gap-2 cursor-pointer py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="font-bold text-gray-700">
                    {userRole === 'admin' ? 'Admin:' : 'Hello,'} {user.firstName}
                  </span>
                  <i className="fas fa-chevron-down text-xs text-gray-400 group-hover:rotate-180 transition-transform duration-200"></i>
                </div>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col py-2 overflow-hidden origin-top-right scale-95 group-hover:scale-100">
                  
                  {/* Seller Links */}
                  {userRole === 'seller' && (
                    <>
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <i className="fas fa-user w-5 text-center text-gray-400"></i> Profile
                      </Link>
                      <Link to="/seller/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <i className="fas fa-tachometer-alt w-5 text-center text-gray-400"></i> Dashboard
                      </Link>
                      <Link to="/seller/add-car" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <i className="fas fa-plus w-5 text-center text-gray-400"></i> Add Car
                      </Link>
                    </>
                  )}

                  {/* Customer Links */}
                  {userRole === 'customer' && (
                    <>
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <i className="fas fa-user w-5 text-center text-gray-400"></i> Profile
                      </Link>
                      <Link to="/cart" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <div className="relative">
                          <i className="fas fa-shopping-cart w-5 text-center text-gray-400"></i>
                          {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">{cartCount}</span>}
                        </div>
                        Cart
                      </Link>
                      <Link to="/wishlist" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <div className="relative">
                          <i className="fas fa-heart w-5 text-center text-gray-400"></i>
                          {wishlistCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">{wishlistCount}</span>}
                        </div>
                        Wishlist
                      </Link>
                      <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <i className="fas fa-box w-5 text-center text-gray-400"></i> Orders
                      </Link>
                      <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <i className="fas fa-tachometer-alt w-5 text-center text-gray-400"></i> Dashboard
                      </Link>
                    </>
                  )}

                  {/* Admin Links */}
                  {userRole === 'admin' && (
                    <>
                      <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <i className="fas fa-tachometer-alt w-5 text-center text-gray-400"></i> Dashboard
                      </Link>
                      <Link to="/admin/users" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <i className="fas fa-users w-5 text-center text-gray-400"></i> User Management
                      </Link>
                    </>
                  )}

                  <div className="h-px bg-gray-100 my-1"></div>
                  
                  <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full text-left">
                    <i className="fas fa-sign-out-alt w-5 text-center"></i> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <DisclosurePanel className="sm:hidden border-t border-gray-100 bg-white">
        <div className="space-y-1 px-4 pb-4 pt-2 shadow-inner">
          <Link to={isLoggedIn && userRole === 'customer' ? "/dashboard" : "/#home"} className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            <HomeIcon className="h-5 w-5 text-gray-400" />
            Home
          </Link>
          <Link to={isLoggedIn && userRole === 'customer' ? "/dashboard#catalog" : "/#cars"} className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            <TruckIcon className="h-5 w-5 text-gray-400" />
            Cars
          </Link>
          <Link to="/about" className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            <InformationCircleIcon className="h-5 w-5 text-gray-400" />
            About
          </Link>
          <Link to="/contact" className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            <PhoneIcon className="h-5 w-5 text-gray-400" />
            Contact
          </Link>
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
};

export default Navbar;