import React, { useState } from 'react';
import { API_ENDPOINTS } from '../../config/api';

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
    
    try {
      const endpoint = API_ENDPOINTS?.CONTACT || 'http://localhost:5001/api/contact';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitMessage(data.message || 'Thank you for your message! We\'ll get back to you soon.');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setSubmitMessage(`Error: ${data.message || 'Failed to send message.'}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitMessage('Error: Unable to connect to the server. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white py-16 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg md:text-xl opacity-90">Get in touch with our team - we're here to help!</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl text-gray-800 font-semibold mb-6">Get In Touch</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-10">
                Have questions about our services? Need help finding the perfect car? 
                Our team is ready to assist you every step of the way.
              </p>

              <div className="mb-12 space-y-8">
                
                {/* Address */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shrink-0 mb-4 sm:mb-0 sm:mr-4 shadow-md">
                    <i className="fas fa-map-marker-alt text-white text-lg"></i>
                  </div>
                  <div>
                    <h3 className="text-gray-800 text-xl font-semibold mb-1">Address</h3>
                    <p className="text-gray-600 leading-relaxed">123 CarCraze Street<br />New Delhi, India 110001</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shrink-0 mb-4 sm:mb-0 sm:mr-4 shadow-md">
                    <i className="fas fa-phone text-white text-lg"></i>
                  </div>
                  <div>
                    <h3 className="text-gray-800 text-xl font-semibold mb-1">Phone</h3>
                    <p className="text-gray-600 leading-relaxed">+91 98765 43210<br />+91 87654 32109</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shrink-0 mb-4 sm:mb-0 sm:mr-4 shadow-md">
                    <i className="fas fa-envelope text-white text-lg"></i>
                  </div>
                  <div>
                    <h3 className="text-gray-800 text-xl font-semibold mb-1">Email</h3>
                    <p className="text-gray-600 leading-relaxed">info@carcraze.com<br />support@carcraze.com</p>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shrink-0 mb-4 sm:mb-0 sm:mr-4 shadow-md">
                    <i className="fas fa-clock text-white text-lg"></i>
                  </div>
                  <div>
                    <h3 className="text-gray-800 text-xl font-semibold mb-1">Business Hours</h3>
                    <p className="text-gray-600 leading-relaxed">Mon - Fri: 9:00 AM - 7:00 PM<br />Sat - Sun: 10:00 AM - 6:00 PM</p>
                  </div>
                </div>

              </div>

              {/* Social Links */}
              <div className="text-center sm:text-left">
                <h3 className="text-gray-800 font-semibold mb-4 text-xl">Follow Us</h3>
                <div className="flex gap-4 justify-center sm:justify-start">
                  <a href="#" className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-indigo-500 transition-all duration-300 hover:bg-indigo-500 hover:text-white hover:-translate-y-1 hover:shadow-lg">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-indigo-500 transition-all duration-300 hover:bg-indigo-500 hover:text-white hover:-translate-y-1 hover:shadow-lg">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-indigo-500 transition-all duration-300 hover:bg-indigo-500 hover:text-white hover:-translate-y-1 hover:shadow-lg">
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-indigo-500 transition-all duration-300 hover:bg-indigo-500 hover:text-white hover:-translate-y-1 hover:shadow-lg">
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl border border-gray-100">
              <h2 className="text-3xl text-gray-800 font-semibold mb-6">Send us a Message</h2>
              
              {submitMessage && (
                <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 transition-opacity duration-500 ${submitMessage.startsWith('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                  <i className={`fas ${submitMessage.startsWith('Error') ? 'fa-exclamation-circle' : 'fa-check-circle'} text-lg`}></i>
                  <span>{submitMessage}</span>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="name" className="block mb-2 text-gray-700 font-medium">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border-2 border-gray-200 rounded-lg text-gray-800 transition-colors focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block mb-2 text-gray-700 font-medium">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border-2 border-gray-200 rounded-lg text-gray-800 transition-colors focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="phone" className="block mb-2 text-gray-700 font-medium">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg text-gray-800 transition-colors focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block mb-2 text-gray-700 font-medium">Subject *</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border-2 border-gray-200 rounded-lg text-gray-800 transition-colors focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white"
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

                <div className="mb-6">
                  <label htmlFor="message" className="block mb-2 text-gray-700 font-medium">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help you..."
                    required
                    className="w-full p-3 border-2 border-gray-200 rounded-lg text-gray-800 transition-colors focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 resize-y min-h-[120px]"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white py-3 px-8 rounded-lg text-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-[0_6px_20px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
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