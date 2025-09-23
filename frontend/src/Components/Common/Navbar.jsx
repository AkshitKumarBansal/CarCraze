import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (isLoggedIn) {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        setUserRole(user.role);
      }
    } else {
      setUserRole(null);
    }
  }, [isLoggedIn]);

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
            <li><Link to="/#cars">Cars</Link></li>
            <li><Link to="/#services">Services</Link></li>
            <li><Link to="/#about">About</Link></li>
            <li><Link to="/#contact">Contact</Link></li>
          </ul>

          {/* Auth Buttons */}
          {!isLoggedIn ? (
            <div className="auth-buttons">
              <Link to="/signup" className="auth-btn sign-up">Sign Up</Link>
              <Link to="/signin" className="auth-btn sign-in">Sign In</Link>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/profile" className="auth-btn profile">Profile</Link>
              <button onClick={handleLogout} className="auth-btn sign-out">
                Sign Out
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
export default Navbar;
