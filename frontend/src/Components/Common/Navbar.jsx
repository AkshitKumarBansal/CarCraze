import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from '../../config/api';
import "./Navbar.css";
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Bars3Icon, BellIcon, XMarkIcon, HomeIcon, TruckIcon, InformationCircleIcon, PhoneIcon, MapPinIcon} from '@heroicons/react/24/outline';

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Check if user is logged in by calling the backend
    const checkAuth = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.PROFILE, {
          credentials: 'include' // Include cookies
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setUserRole(userData.role);
          // Also store in localStorage for quick access
          localStorage.setItem('user', JSON.stringify(userData));
          if (setIsLoggedIn) {
            setIsLoggedIn(true);
          }

          // Fetch cart count for customers
          if (userData.role === 'customer') {
            const cartRes = await fetch(API_ENDPOINTS.CART, {
              credentials: 'include'
            });
            if (cartRes.ok) {
              const cartData = await cartRes.json();
              setCartCount(Array.isArray(cartData.items) ? cartData.items.length : 0);
            }
          }
        } else {
          // Not authenticated
          setUser(null);
          setUserRole(null);
          localStorage.removeItem('user');
          if (setIsLoggedIn) {
            setIsLoggedIn(false);
          }
        }
      } catch (err) {
        console.error('Failed to check auth', err);
        setUser(null);
        setUserRole(null);
        localStorage.removeItem('user');
        if (setIsLoggedIn) {
          setIsLoggedIn(false);
        }
      }
    };

    checkAuth();
  }, [setIsLoggedIn, isLoggedIn]);

  // Debug log to check current state
  console.log("Navbar rendered - isLoggedIn:", isLoggedIn);

  const handleLogout = async () => {
    console.log("Logging out... current isLoggedIn:", isLoggedIn);
    try {
      // Call backend logout endpoint to clear cookie
      await fetch(API_ENDPOINTS.LOGOUT, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout error:', err);
    }

    // Clear local storage
    localStorage.removeItem("user");
    setUser(null);
    setUserRole(null);
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <Disclosure as="nav" className="header bg-white/98 fixed top-0 left-0 right-0 z-[1000] backdrop-blur-[20px] shadow-[0_4px_30px_rgba(0,0,0,0.08)] border-b border-[rgba(102,126,234,0.1)]">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          {/* Mobile Menu Button */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="block h-6 w-6 group-data-[open]:hidden" aria-hidden="true" />
              <XMarkIcon className="hidden h-6 w-6 group-data-[open]:block" aria-hidden="true" />
            </DisclosureButton>
          </div>
          {/* Logo */}
          <div className="flex items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <span className="text-3xl">🚗</span>
              CarCraze
            </Link>
          </div>
          {/* Nav Links (Desktop) */}
          <ul className="hidden sm:flex items-center gap-10">
            <li>

              <Link
                to={isLoggedIn && userRole === 'customer' ? "/dashboard" : "/#home"}
                className="relative font-semibold text-gray-600 text-sm py-2 transition hover:text-indigo-500
                          after:absolute after:left-0 after:bottom-0 after:h-[3px] after:w-0
                          after:rounded after:bg-gradient-to-r after:from-indigo-500 after:to-purple-500
                          after:transition-all after:duration-300 hover:after:w-full"
              >
                Home
              </Link>

              {/* <Link to={isLoggedIn ? (userRole === 'customer' ? "/dashboard" : userRole === 'seller' ? "/seller/dashboard" : "/#home") : "/#home"}>Home</Link> */}
            </li>

            <li>
              <Link
                to={isLoggedIn && userRole === 'customer' ? "/dashboard#catalog" : "/#cars"}
                className="relative font-semibold text-gray-600 text-sm py-2 transition hover:text-indigo-500
                          after:absolute after:left-0 after:bottom-0 after:h-[3px] after:w-0
                          after:rounded after:bg-gradient-to-r after:from-indigo-500 after:to-purple-500
                          after:transition-all after:duration-300 hover:after:w-full"
              >
                Cars
              </Link>
            </li>

            <li>
              <Link
                to="/about"
                className="relative font-semibold text-gray-600 text-sm py-2 transition hover:text-indigo-500
                          after:absolute after:left-0 after:bottom-0 after:h-[3px] after:w-0
                          after:rounded after:bg-gradient-to-r after:from-indigo-500 after:to-purple-500
                          after:transition-all after:duration-300 hover:after:w-full"
              >
                About
              </Link>
            </li>

            <li>
              <Link
                to="/contact"
                className="relative font-semibold text-gray-600 text-sm py-2 transition hover:text-indigo-500
                          after:absolute after:left-0 after:bottom-0 after:h-[3px] after:w-0
                          after:rounded after:bg-gradient-to-r after:from-indigo-500 after:to-purple-500
                          after:transition-all after:duration-300 hover:after:w-full"
              >
                Contact
              </Link>
            </li>
          </ul>
          <div className="hidden sm:flex items-center gap-4">
            {/*Location*/}
            {user && (
              <button
                type="button"
                className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
              >
                <MapPinIcon className="h-5 w-5" />
                <span>Delhi</span>
              </button>
            )}
            {/*Notifications*/}
            {user && (
              <button
                type="button"
                className="relative rounded-full p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" />
              </button>
            )}

            {/* Profile / Auth buttons */}
          </div>


            {/* Auth Buttons */}
            {!user ? (
              <div className="auth-buttons">
                <Link to="/signup" className="auth-btn sign-up">Sign Up</Link>
                <Link to="/signin" className="auth-btn sign-in">Sign In</Link>
              </div>
            ) : (
              <div className="auth-buttons">
                {userRole === 'seller' ? (
                  <>
                    <div className="user-profile">
                      <span className="user-name">Hello, {user.firstName}</span>
                      <div className="profile-dropdown">
                        <Link to="/profile" className="auth-btn profile">
                          <i className="fas fa-user"></i> Profile
                        </Link>
                        <Link to="/seller/dashboard" className="auth-btn profile">
                          <i className="fas fa-tachometer-alt"></i> Dashboard
                        </Link>
                        <Link to="/seller/add-car" className="auth-btn profile">
                          <i className="fas fa-plus"></i> Add Car
                        </Link>
                        <button onClick={handleLogout} className="auth-btn sign-out">
                          <i className="fas fa-sign-out-alt"></i> Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                ) : userRole === 'customer' ? (
                  <>
                    <div className="user-profile">
                      <span className="user-name">Hello, {user.firstName}</span>
                      <div className="profile-dropdown">
                        <Link to="/profile" className="auth-btn profile">
                          <i className="fas fa-user"></i> Profile
                        </Link>
                        <Link to="/cart" className="auth-btn profile cart-link">
                          <i className="fas fa-shopping-cart"></i> Cart
                          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                        </Link>
                        <Link to="/orders" className="auth-btn profile">
                          <i className="fas fa-box"></i> Orders
                        </Link>
                        <Link to="/dashboard" className="auth-btn profile">
                          <i className="fas fa-tachometer-alt"></i> Dashboard
                        </Link>
                        <button onClick={handleLogout} className="auth-btn sign-out">
                          <i className="fas fa-sign-out-alt"></i> Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <button onClick={handleLogout} className="auth-btn sign-out">
                    Sign Out
                  </button>
                )}
              </div>
            )}
          {/* </nav> */}
        </div>
      </div>
      {/* Mobile Menu Panel */}
      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pb-4 pt-2">
          {/* Home */}
          <Link to={isLoggedIn && userRole === 'customer' ? "/dashboard" : "/#home"} className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600" >
            <HomeIcon className="h-5 w-5" />
            Home
          </Link>
          {/* Cars */}
          <Link to={isLoggedIn && userRole === 'customer' ? "/dashboard#catalog" : "/#cars"} className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600" >
            <TruckIcon className="h-5 w-5" />
            Cars
          </Link>
          {/* About */}
          <Link to="/about" className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600" >
            <InformationCircleIcon className="h-5 w-5" />
            About
          </Link>
          {/* Contact */}
          <Link to="/contact" className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600" >
            <PhoneIcon className="h-5 w-5" />
            Contact
          </Link>
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
};
export default Navbar;
