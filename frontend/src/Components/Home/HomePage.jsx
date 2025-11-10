import React, { useState } from 'react';
import '/src/index.css';
import Service from '../Common/Service';

// Import common components
import Navbar from '../Common/Navbar';

// Import home-specific components
import Hero from './Hero';
import FeaturedCars from './FeaturedCars';

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
      <Service />
    </div>
  );
};

export default HomePage;