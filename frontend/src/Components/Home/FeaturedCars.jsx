import React, { useState, useEffect, useCallback } from "react";
import useScrollAnimation from "../../Hooks/useScrollAnimation";
import CarCard from "../Common/CarCard";
import { API_ENDPOINTS } from '../../config/api';

const FeaturedCars = ({ searchCriteria }) => {
  const [sectionRef, isVisible] = useScrollAnimation(0.1);
  const [sellerCars, setSellerCars] = useState([]);

  // Fetch cars from backend
  const fetchCars = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.CARS);
      if (!response.ok) throw new Error('Failed to fetch cars');
      const data = await response.json();

      // Transform backend cars to match frontend format
      const transformedCars = (data.cars || []).map(car => ({
        id: car._id || car.id,
        name: `${car.year || ''} ${car.brand || ''} ${car.model || ''}`.trim(),
        seats: car.capacity,
        transmission: car.transmission,
        fuel: car.fuelType,
        price: car.price,
        icon: car.listingType === 'rent' ? "fas fa-car" : "fas fa-car-side",
        // prefer the first uploaded image if available
        image: car.images && car.images.length > 0 ? car.images[0] : null,
        type: car.transmission === 'automatic' ? 'luxury' : 'midsize',
        category: car.listingType === 'rent' ? 'rent' :
          car.listingType === 'sale_new' ? 'buy-new' : 'buy-used',
        mileage: car.mileage,
        color: car.color,
        location: car.location,
        description: car.description,
        raw: car
      }));

      setSellerCars(transformedCars);
    } catch (error) {
      console.error('Error fetching cars:', error);
      setSellerCars([]);
    }
  }, []);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  // Hardcoded fallback data preserved from your original file
  const rentalCars = [
    { id: 1, name: "Toyota Camry", seats: 5, transmission: "automatic", fuel: "Petrol", price: 3500, icon: "fas fa-car", type: "midsize", category: "rent" },
    { id: 2, name: "BMW X5", seats: 7, transmission: "automatic", fuel: "Petrol", price: 8000, icon: "fas fa-car-side", type: "suv", category: "rent" },
    { id: 3, name: "Mercedes C-Class", seats: 5, transmission: "automatic", fuel: "Petrol", price: 7000, icon: "fas fa-car", type: "luxury", category: "rent" },
    { id: 4, name: "Honda CR-V", seats: 5, transmission: "automatic", fuel: "Hybrid", price: 4500, icon: "fas fa-car-side", type: "suv", category: "rent" },
    { id: 5, name: "Audi A4", seats: 5, transmission: "automatic", fuel: "Petrol", price: 6500, icon: "fas fa-car", type: "luxury", category: "rent" },
  ];

  const newCars = [
    { id: 11, name: "2024 Tesla Model S", seats: 5, transmission: "automatic", fuel: "Electric", price: 8500000, icon: "fas fa-car", type: "luxury", category: "buy-new" },
    { id: 12, name: "2024 BMW 3 Series", seats: 5, transmission: "automatic", fuel: "Petrol", price: 5500000, icon: "fas fa-car", type: "luxury", category: "buy-new" },
    { id: 13, name: "2024 Toyota Prius", seats: 5, transmission: "automatic", fuel: "Hybrid", price: 3500000, icon: "fas fa-car", type: "compact", category: "buy-new" },
    { id: 14, name: "2024 Ford F-150", seats: 5, transmission: "automatic", fuel: "Petrol", price: 6500000, icon: "fas fa-truck", type: "truck", category: "buy-new" },
    { id: 15, name: "2024 Honda Accord", seats: 5, transmission: "automatic", fuel: "Petrol", price: 3200000, icon: "fas fa-car", type: "midsize", category: "buy-new" },
  ];

  const usedCars = [
    { id: 16, name: "2019 Toyota Corolla", seats: 5, transmission: "automatic", fuel: "Petrol", price: 1200000, icon: "fas fa-car", type: "compact", category: "buy-used" },
    { id: 17, name: "2018 Honda Civic", seats: 5, transmission: "manual", fuel: "Petrol", price: 900000, icon: "fas fa-car", type: "compact", category: "buy-used" },
    { id: 18, name: "2020 Nissan Altima", seats: 5, transmission: "automatic", fuel: "Petrol", price: 1500000, icon: "fas fa-car", type: "midsize", category: "buy-used" },
    { id: 19, name: "2017 BMW X3", seats: 5, transmission: "automatic", fuel: "Petrol", price: 2500000, icon: "fas fa-car-side", type: "suv", category: "buy-used" },
    { id: 20, name: "2019 Ford Escape", seats: 5, transmission: "automatic", fuel: "Petrol", price: 1800000, icon: "fas fa-car-side", type: "suv", category: "buy-used" },
  ];

  // Show only cars uploaded by users (backend data)
  const allCars = sellerCars;

  // Filter cars by searchCriteria if provided
  const filteredCars = searchCriteria
    ? allCars.filter((car) => car.category === searchCriteria)
    : allCars;

  return (
    <section
      ref={sectionRef}
      className={`py-12 md:py-20 bg-gray-50 transition-all duration-800 ease-in-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-8">
          Featured Cars
        </h2>
        
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6 md:gap-8 mt-8">
          {filteredCars.length > 0 ? (
            filteredCars.map((car) => (
              <CarCard key={car.id} car={car} onActionSuccess={fetchCars} />
            ))
          ) : (
            <p className="text-center text-gray-500 font-medium col-span-full py-10">
              No cars match your search.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCars;