import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitMessage('Thank you for your message! We\'ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    }, 1000);
  };

  return (
    <div className="contact-container">
      <div className="contact-hero">
        <div className="container">
          <h1>Contact Us</h1>
          <p>Get in touch with our team - we're here to help!</p>
        </div>
      </div>

      <div className="contact-content">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Information */}
            <div className="contact-info">
              <h2>Get In Touch</h2>
              <p>
                Have questions about our services? Need help finding the perfect car? 
                Our team is ready to assist you every step of the way.
              </p>

              <div className="contact-details">
                <div className="contact-item">
                  <div className="contact-icon">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div className="contact-text">
                    <h3>Address</h3>
                    <p>123 CarCraze Street<br />New Delhi, India 110001</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">
                    <i className="fas fa-phone"></i>
                  </div>
                  <div className="contact-text">
                    <h3>Phone</h3>
                    <p>+91 98765 43210<br />+91 87654 32109</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div className="contact-text">
                    <h3>Email</h3>
                    <p>info@carcraze.com<br />support@carcraze.com</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="contact-text">
                    <h3>Business Hours</h3>
                    <p>Mon - Fri: 9:00 AM - 7:00 PM<br />Sat - Sun: 10:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="social-links">
                <h3>Follow Us</h3>
                <div className="social-icons">
                  <a href="#" className="social-icon">
                    <i className="fab fa-facebook"></i>
                  </a>
                  <a href="#" className="social-icon">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="#" className="social-icon">
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a href="#" className="social-icon">
                    <i className="fab fa-linkedin"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form">
              <h2>Send us a Message</h2>
              {submitMessage && (
                <div className="success-message">
                  <i className="fas fa-check-circle"></i>
                  {submitMessage}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="subject">Subject *</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="buying">Buying a Car</option>
                      <option value="selling">Selling a Car</option>
                      <option value="rental">Car Rental</option>
                      <option value="support">Technical Support</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help you..."
                    required
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
