import React, { useState } from 'react';
import '/src/index.css';

// Import common components
import Navbar from '../Common/Navbar';
import Footer from '../Common/Footer';

// Import home-specific components
import Hero from './Hero';
import FeaturedCars from './FeaturedCars';
import Services from '../Common/Service';

const HomePage = () => {
  const [searchCriteria, setSearchCriteria] = useState(null);

  const handleSearch = (criteria) => {
    setSearchCriteria(criteria);
    // Scroll to featured cars section
    document.getElementById('cars')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="home-page">
      <Navbar />
      <Hero onSearch={handleSearch} />
      <FeaturedCars searchCriteria={searchCriteria} />
      <Services />
      <Footer />
    </div>
  );
};

export default HomePage;