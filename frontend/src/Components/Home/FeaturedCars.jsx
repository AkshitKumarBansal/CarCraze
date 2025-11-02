import React, { useState, useEffect } from "react";
import useScrollAnimation from "../../Hooks/useScrollAnimation";
import CarCard from "./CarCard";
import './FeaturedCars.css';

const FeaturedCars = ({ searchCriteria }) => {
  const [sectionRef, isVisible] = useScrollAnimation(0.1);
  const [sellerCars, setSellerCars] = useState([]);

  // Fetch cars from backend
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/cars');
        const data = await response.json();
        
        // Transform backend cars to match frontend format
        const transformedCars = data.cars.map(car => ({
          id: car.id,
          name: `${car.year} ${car.brand} ${car.model}`,
          seats: car.capacity,
          transmission: car.transmission,
          fuel: car.fuelType,
          price: car.price,
          icon: car.listingType === 'rent' ? "fas fa-car" : "fas fa-car-side",
          type: car.transmission === 'automatic' ? 'luxury' : 'midsize',
          category: car.listingType === 'rent' ? 'rent' : 
                   car.listingType === 'sale_new' ? 'buy-new' : 'buy-used',
          image: car.images && car.images.length > 0 ? car.images[0] : null,
          mileage: car.mileage,
          color: car.color,
          location: car.location,
          description: car.description
        }));
        
        setSellerCars(transformedCars);
      } catch (error) {
        console.error('Error fetching cars:', error);
        setSellerCars([]);
      }
    };

    fetchCars();
  }, []);

  const rentalCars = [
    {
      id: 1,
      name: "Toyota Camry",
      seats: 5,
      transmission: "automatic",
      fuel: "Petrol",
      price: 45,
      icon: "fas fa-car",
      type: "midsize",
      category: "rent",
    },
    {
      id: 2,
      name: "BMW X5",
      seats: 7,
      transmission: "automatic",
      fuel: "Petrol",
      price: 89,
      icon: "fas fa-car-side",
      type: "suv",
      category: "rent",
    },
    {
      id: 3,
      name: "Mercedes C-Class",
      seats: 5,
      transmission: "automatic",
      fuel: "Petrol",
      price: 75,
      icon: "fas fa-car",
      type: "luxury",
      category: "rent",
    },
    {
      id: 4,
      name: "Honda CR-V",
      seats: 5,
      transmission: "automatic",
      fuel: "Hybrid",
      price: 55,
      icon: "fas fa-car-side",
      type: "suv",
      category: "rent",
    },
    {
      id: 5,
      name: "Audi A4",
      seats: 5,
      transmission: "automatic",
      fuel: "Petrol",
      price: 68,
      icon: "fas fa-car",
      type: "luxury",
      category: "rent",
    },
  ];

  const newCars = [
    {
      id: 11,
      name: "2024 Tesla Model S",
      seats: 5,
      transmission: "automatic",
      fuel: "Electric",
      price: 95000,
      icon: "fas fa-car",
      type: "luxury",
      category: "buy-new",
    },
    {
      id: 12,
      name: "2024 BMW 3 Series",
      seats: 5,
      transmission: "automatic",
      fuel: "Petrol",
      price: 45000,
      icon: "fas fa-car",
      type: "luxury",
      category: "buy-new",
    },
    {
      id: 13,
      name: "2024 Toyota Prius",
      seats: 5,
      transmission: "automatic",
      fuel: "Hybrid",
      price: 28000,
      icon: "fas fa-car",
      type: "compact",
      category: "buy-new",
    },
    {
      id: 14,
      name: "2024 Ford F-150",
      seats: 5,
      transmission: "automatic",
      fuel: "Petrol",
      price: 55000,
      icon: "fas fa-truck",
      type: "truck",
      category: "buy-new",
    },
    {
      id: 15,
      name: "2024 Honda Accord",
      seats: 5,
      transmission: "automatic",
      fuel: "Petrol",
      price: 32000,
      icon: "fas fa-car",
      type: "midsize",
      category: "buy-new",
    },
  ];

  const usedCars = [
    {
      id: 16,
      name: "2019 Toyota Corolla",
      seats: 5,
      transmission: "automatic",
      fuel: "Petrol",
      price: 18000,
      icon: "fas fa-car",
      type: "compact",
      category: "buy-used",
    },
    {
      id: 17,
      name: "2018 Honda Civic",
      seats: 5,
      transmission: "manual",
      fuel: "Petrol",
      price: 16000,
      icon: "fas fa-car",
      type: "compact",
      category: "buy-used",
    },
    {
      id: 18,
      name: "2020 Nissan Altima",
      seats: 5,
      transmission: "automatic",
      fuel: "Petrol",
      price: 22000,
      icon: "fas fa-car",
      type: "midsize",
      category: "buy-used",
    },
    {
      id: 19,
      name: "2017 BMW X3",
      seats: 5,
      transmission: "automatic",
      fuel: "Petrol",
      price: 28000,
      icon: "fas fa-car-side",
      type: "suv",
      category: "buy-used",
    },
    {
      id: 20,
      name: "2019 Ford Escape",
      seats: 5,
      transmission: "automatic",
      fuel: "Petrol",
      price: 20000,
      icon: "fas fa-car-side",
      type: "suv",
      category: "buy-used",
    },
  ];

  // Combine all cars including seller cars from backend
  const allCars = [...rentalCars, ...newCars, ...usedCars, ...sellerCars];

  // Filter cars by searchCriteria if provided
  const filteredCars = searchCriteria
    ? allCars.filter((car) => car.category === searchCriteria)
    : allCars;

  return (
    <section
      ref={sectionRef}
      className={`featured-cars ${isVisible ? "visible" : "hidden"}`}
    >
      <div className="container">
        <h2 className="section-title">Featured Cars</h2>
        <div className="car-grid">
          {filteredCars.length > 0 ? (
            filteredCars.map((car) => <CarCard key={car.id} car={car} />)
          ) : (
            <p>No cars match your search.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCars;