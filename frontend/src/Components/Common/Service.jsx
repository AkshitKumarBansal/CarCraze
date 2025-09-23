import React from "react";
import "./Service.css";

const services = [
  {
    id: 1,
    title: "Buy a Car",
    description: "Browse through a wide range of cars and purchase your dream car with ease.",
    icon: "fas fa-car-side",
  },
  {
    id: 2,
    title: "Rent a Car",
    description: "Need a car for a trip? Rent one at affordable rates and enjoy hassle-free rides.",
    icon: "fas fa-key",
  },
  {
    id: 3,
    title: "Sell Your Car",
    description: "List your car, reach potential buyers quickly, and sell it at the best price.",
    icon: "fas fa-dollar-sign",
  },
];

const Service = () => {
  return (
    <section className="services-section">
      <div className="container">
        <h2 className="services-title">Our Services</h2>
        <p className="services-subtitle">
          Explore the wide range of services we provide to make your car journey smooth and easy.
        </p>

        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <i className={service.icon}></i>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Service;
