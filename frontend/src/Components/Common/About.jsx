import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <div className="about-hero">
        <div className="container">
          <h1>About CarCraze</h1>
          <p>Your trusted partner in finding the perfect car</p>
        </div>
      </div>

      <div className="about-content">
        <div className="container">
          <section className="about-section">
            <h2>Our Story</h2>
            <p>
              CarCraze was founded with a simple mission: to make car buying, selling, and renting 
              as easy and transparent as possible. We believe that everyone deserves access to 
              quality vehicles at fair prices, whether you're looking to buy your first car, 
              upgrade to a newer model, or rent a vehicle for your next adventure.
            </p>
          </section>

          <section className="about-section">
            <h2>Our Mission</h2>
            <div className="mission-grid">
              <div className="mission-card">
                <div className="mission-icon">
                  <i className="fas fa-handshake"></i>
                </div>
                <h3>Trust & Transparency</h3>
                <p>We provide honest, detailed information about every vehicle on our platform.</p>
              </div>
              <div className="mission-card">
                <div className="mission-icon">
                  <i className="fas fa-search"></i>
                </div>
                <h3>Easy Discovery</h3>
                <p>Find the perfect car with our intuitive search and filtering tools.</p>
              </div>
              <div className="mission-card">
                <div className="mission-icon">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <h3>Quality Assurance</h3>
                <p>Every vehicle is thoroughly inspected to ensure quality and reliability.</p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>Why Choose CarCraze?</h2>
            <div className="features-list">
              <div className="feature-item">
                <i className="fas fa-check-circle"></i>
                <span>Extensive inventory of new, used, and rental cars</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-check-circle"></i>
                <span>Verified sellers and transparent pricing</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-check-circle"></i>
                <span>Easy online booking and reservation system</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-check-circle"></i>
                <span>24/7 customer support</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-check-circle"></i>
                <span>Secure payment processing</span>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>Our Services</h2>
            <div className="services-grid">
              <div className="service-card">
                <h3>Buy New Cars</h3>
                <p>Browse the latest models from top brands with full warranty coverage.</p>
              </div>
              <div className="service-card">
                <h3>Buy Used Cars</h3>
                <p>Quality pre-owned vehicles thoroughly inspected and certified.</p>
              </div>
              <div className="service-card">
                <h3>Car Rentals</h3>
                <p>Short-term and long-term rental options for all your travel needs.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
