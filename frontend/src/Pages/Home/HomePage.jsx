import React, { useState } from 'react';
import '../../index.css'; // Adjusted for the new path
import Service from '../Public/Service'; // Assuming Service.jsx is directly in src/Pages/
import Navbar from '../../Components/Layout/Navbar';
import Hero from '../../Components/Home/Hero';
import FeaturedCars from '../../Components/Home/FeaturedCars';

const HomePage = () => {
  const [searchCriteria, setSearchCriteria] = useState(null);

  const handleSearch = (criteria) => {
    setSearchCriteria(criteria);
    // Scroll to featured cars section
    document.getElementById('cars')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <Navbar />
      <Hero onSearch={handleSearch} />
      <div id="cars">
        <FeaturedCars searchCriteria={searchCriteria} />
      </div>
      <Service />
    </div>
  );
};

export default HomePage;