import React from 'react';
import { Link } from 'react-router-dom';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import './Footer.css';

const Footer = () => {
  const [footerRef, isFooterVisible] = useScrollAnimation(0.1);

  return (
    <footer className={`footer ${isFooterVisible ? 'animate-in' : ''}`} id="contact" ref={footerRef}>
      <div className="container">
        <div className="footer-content">
          <div className={`footer-section ${isFooterVisible ? 'slide-in-left' : ''}`}>
            <h3>CarCraze</h3>
            <p>Built to Move You - Experience the ultimate in premium car rentals. Every vehicle is carefully selected to deliver the drive of your dreams.</p>
          </div>
          <div className={`footer-section ${isFooterVisible ? 'slide-in-up delay-1' : ''}`}>
            <h3>Quick Links</h3>
            <p><a href="#home">Home</a></p>
            <p><a href="#cars">Cars</a></p>
            <p><a href="#services">Services</a></p>
            <p><a href="#about">About Us</a></p>
          </div>
          <div className={`footer-section ${isFooterVisible ? 'slide-in-up delay-2' : ''}`}>
            <h3>Contact Info</h3>
            <p><i className="fas fa-phone"></i> +1 (555) 123-4567</p>
            <p><i className="fas fa-envelope"></i> info@carcraze.com</p>
            <p><i className="fas fa-map-marker-alt"></i> 123 Main St, City, State 12345</p>
          </div>
          <div className={`footer-section ${isFooterVisible ? 'slide-in-right' : ''}`}>
            <h3>Follow Us</h3>
            <p><a href="#"><i className="fab fa-facebook"></i> Facebook</a></p>
            <p><a href="#"><i className="fab fa-twitter"></i> Twitter</a></p>
            <p><a href="#"><i className="fab fa-instagram"></i> Instagram</a></p>
            <p><a href="#"><i className="fab fa-linkedin"></i> LinkedIn</a></p>
          </div>
        </div>
        <div className={`footer-bottom ${isFooterVisible ? 'fade-in-up delay-3' : ''}`}>
          <p>&copy; 2024 CarCraze. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
