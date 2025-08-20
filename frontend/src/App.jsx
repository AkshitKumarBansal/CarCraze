import React, { useState } from 'react';
import SignIn from './Components/LoginDetails/SignIn';
import SignUp from './Components/LoginDetails/SignUp';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'signin':
        return <SignIn onSwitchToSignUp={() => setCurrentView('signup')} />;
      case 'signup':
        return <SignUp onSwitchToSignIn={() => setCurrentView('signin')} />;
      default:
        return (
          <div className="home-container">
            <div className="hero-section">
              <div className="hero-content">
                <h1 className="hero-title">
                  Welcome to <span className="brand-name">CarCraze</span>
                </h1>
                <p className="hero-subtitle">
                  Your ultimate destination for buying and selling cars
                </p>
                <p className="hero-description">
                  Join thousands of customers, sellers, and dealers in the most trusted automotive marketplace
                </p>
                
                <div className="auth-buttons">
                  <button 
                    className="auth-btn signin-btn"
                    onClick={() => setCurrentView('signin')}
                  >
                    Sign In
                  </button>
                  <button 
                    className="auth-btn signup-btn"
                    onClick={() => setCurrentView('signup')}
                  >
                    Create Account
                  </button>
                </div>

                <div className="features-grid">
                  <div className="feature-card">
                    <div className="feature-icon">🚗</div>
                    <h3>For Customers</h3>
                    <p>Browse thousands of cars, compare prices, and find your perfect vehicle</p>
                  </div>
                  
                  <div className="feature-card">
                    <div className="feature-icon">🏪</div>
                    <h3>For Sellers</h3>
                    <p>List your cars, manage inventory, and reach millions of potential buyers</p>
                  </div>
                  
                  <div className="feature-card">
                    <div className="feature-icon">⚙️</div>
                    <h3>For Admins</h3>
                    <p>Manage the platform, oversee transactions, and ensure quality service</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Back to home button for when viewing auth components */}
            {currentView !== 'home' && (
              <button 
                className="back-home-btn"
                onClick={() => setCurrentView('home')}
              >
                ← Back to Home
              </button>
            )}
          </div>
        );
    }
  };

  return (
    <div className="App">
      {currentView !== 'home' && (
        <nav className="top-nav">
          <div className="nav-content">
            <button 
              className="logo-btn"
              onClick={() => setCurrentView('home')}
            >
              <span className="logo">CarCraze</span>
            </button>
          </div>
        </nav>
      )}
      
      {renderCurrentView()}
    </div>
  );
}

export default App;