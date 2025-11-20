import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from '../../config/api';
import "./Navbar.css";

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Check if user is logged in by checking token and user data
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setUserRole(parsedUser.role);
      if (setIsLoggedIn) {
        setIsLoggedIn(true);
      }
    } else {
      setUser(null);
      setUserRole(null);
      if (setIsLoggedIn) {
        setIsLoggedIn(false);
      }
    }
    // Fetch cart count for customers
    (async () => {
      try {
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          if (parsedUser.role === 'customer') {
            const res = await fetch(API_ENDPOINTS.CART, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
              const d = await res.json();
              setCartCount(Array.isArray(d.items) ? d.items.length : 0);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch cart count', err);
      }
    })();
  }, [setIsLoggedIn]);

  // Debug log to check current state
  console.log("Navbar rendered - isLoggedIn:", isLoggedIn);

  const handleLogout = () => {
    console.log("Logging out... current isLoggedIn:", isLoggedIn); // before logout
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // Also clear user data
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          {/* Logo */}
          <Link to="/" className="logo">
            <div className="logo-icon">
              🚗
            </div>
            CarCraze
          </Link>

          {/* Nav Links */}
          <ul className="nav-links">
            <li>
              <Link to={isLoggedIn && userRole === 'customer' ? "/dashboard" : "/#home"}>Home</Link>
            </li>
            <li>
              <Link to={isLoggedIn && userRole === 'customer' ? "/dashboard#catalog" : "/#cars"}>
                Cars
              </Link>
            </li>
            {/* <li><Link to="/services">Services</Link></li> */}
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>

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
        </nav>
      </div>
    </header>
  );
};
export default Navbar;
