import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();

  // 🔎 Debug log to check current state
  console.log("Navbar rendered - isLoggedIn:", isLoggedIn);

  const handleLogout = () => {
    console.log("Logging out... current isLoggedIn:", isLoggedIn); // before logout
    localStorage.removeItem("token"); 
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
            <li><Link to="/#home">Home</Link></li>
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
