import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    // Simulate subscription success
    alert('Thanks for subscribing to CarCraze updates!');
    setEmail('');
  };

  return (
    <footer className="bg-neutral-900 text-neutral-400 pt-12 text-sm leading-relaxed">
      <div className="max-w-[1200px] mx-auto px-5">
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-[2fr_1fr_1fr_1.5fr_1.5fr] gap-6 items-start">
          
          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5 text-white text-[22px] font-bold no-underline mb-2">
              <svg viewBox="0 0 120 60" className="h-[30px] w-auto" aria-hidden>
                <defs>
                  <linearGradient id="footerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ffffff"/>
                    <stop offset="100%" stopColor="#e5e7eb"/>
                  </linearGradient>
                </defs>
                <path d="M20 35 Q25 20 45 20 L75 20 Q95 20 100 35 L105 40 Q100 48 90 48 L30 48 Q20 48 15 40 Z" fill="url(#footerGradient)" />
                <path d="M35 25 Q40 22 50 22 L70 22 Q80 22 85 25 L82 32 L38 32 Z" fill="rgba(0,0,0,0.3)" />
                <path d="M38 32 L45 28 L65 28 L72 32 Z" fill="rgba(0,0,0,0.2)" />
                <circle cx="35" cy="45" r="8" fill="#1f2937" stroke="#374151" strokeWidth="1"/>
                <circle cx="35" cy="45" r="5" fill="#6b7280"/>
                <circle cx="85" cy="45" r="8" fill="#1f2937" stroke="#374151" strokeWidth="1"/>
                <circle cx="85" cy="45" r="5" fill="#6b7280"/>
                <circle cx="102" cy="38" r="3" fill="#fbbf24"/>
              </svg>
              <span>CarCraze</span>
            </Link>
            <p className="text-gray-400 mt-2 mb-3">Your trusted partner to buy, sell and rent cars with confidence.</p>
            
            <div className="flex gap-2.5">
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-gray-200 transition-all duration-200 hover:bg-neutral-700 hover:-translate-y-[1px]">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" aria-label="Twitter" className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-gray-200 transition-all duration-200 hover:bg-neutral-700 hover:-translate-y-[1px]">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-gray-200 transition-all duration-200 hover:bg-neutral-700 hover:-translate-y-[1px]">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" aria-label="LinkedIn" className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-gray-200 transition-all duration-200 hover:bg-neutral-700 hover:-translate-y-[1px]">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white mb-2.5 text-base font-medium">Quick Links</h4>
            <ul className="space-y-1.5">
              <li><Link to="/" className="text-neutral-400 hover:text-white hover:underline transition-colors">Home</Link></li>
              <li><Link to="/services" className="text-neutral-400 hover:text-white hover:underline transition-colors">Services</Link></li>
              <li><Link to="/about" className="text-neutral-400 hover:text-white hover:underline transition-colors">About</Link></li>
              <li><Link to="/contact" className="text-neutral-400 hover:text-white hover:underline transition-colors">Contact</Link></li>
              <li><Link to="/profile" className="text-neutral-400 hover:text-white hover:underline transition-colors">Profile</Link></li>
            </ul>
          </div>

          {/* Our Services */}
          <div>
            <h4 className="text-white mb-2.5 text-base font-medium">Our Services</h4>
            <ul className="space-y-1.5">
              <li><Link to="/new-cars" className="text-neutral-400 hover:text-white hover:underline transition-colors">Buy New Cars</Link></li>
              <li><Link to="/old-cars" className="text-neutral-400 hover:text-white hover:underline transition-colors">Buy Used Cars</Link></li>
              <li><Link to="/rent-cars" className="text-neutral-400 hover:text-white hover:underline transition-colors">Rent a Car</Link></li>
              <li><Link to="/seller/dashboard" className="text-neutral-400 hover:text-white hover:underline transition-colors">Sell New Cars</Link></li>
              <li><Link to="/seller/dashboard" className="text-neutral-400 hover:text-white hover:underline transition-colors">Sell Used Cars</Link></li>
              <li><Link to="/seller/dashboard" className="text-neutral-400 hover:text-white hover:underline transition-colors">Put Car on Rent</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white mb-2.5 text-base font-medium">Contact</h4>
            <ul className="space-y-1.5">
              <li className="flex gap-2 items-center">
                <i className="fas fa-map-marker-alt text-gray-300"></i>
                <span>123 CarCraze Street, New Delhi, India</span>
              </li>
              <li className="flex gap-2 items-center">
                <i className="fas fa-envelope text-gray-300"></i>
                <a href="mailto:info@carcraze.com" className="text-neutral-400 hover:text-white hover:underline transition-colors">info@carcraze.com</a>
              </li>
              <li className="flex gap-2 items-center">
                <i className="fas fa-phone text-gray-300"></i>
                <a href="tel:+919876543210" className="text-neutral-400 hover:text-white hover:underline transition-colors">+91 98765 43210</a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white mb-2.5 text-base font-medium">Stay in the loop</h4>
            <p className="mb-2">Get updates on new arrivals, offers and tips.</p>
            <form className="flex flex-col sm:flex-row gap-2 mt-2" onSubmit={handleSubscribe}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                aria-label="Email address"
                required
                className="flex-1 px-3 py-2.5 border border-neutral-700 bg-black text-gray-200 rounded-lg outline-none focus:border-blue-500 transition-colors"
              />
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2.5 rounded-lg transition-colors font-medium sm:w-auto w-full"
              >
                Subscribe
              </button>
            </form>
          </div>
          
        </div>

        {/* Bottom bar */}
        <div className="border-t border-neutral-800 mt-7 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-wrap">
          <div>&copy; {new Date().getFullYear()} CarCraze. All rights reserved.</div>
          <div className="flex gap-4">
            <Link to="/privacy" className="text-neutral-400 hover:text-white hover:underline transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-neutral-400 hover:text-white hover:underline transition-colors">Terms of Service</Link>
            <Link to="/contact" className="text-neutral-400 hover:text-white hover:underline transition-colors">Contact Us</Link>
          </div>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;