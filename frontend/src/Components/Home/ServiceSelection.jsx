import React from 'react';

const ServiceSelection = ({ onServiceSelect, onClose }) => {
  const services = [
    {
      id: 'rent',
      title: 'Rent a Car',
      description: 'Short-term rental for your travel needs',
      icon: 'fas fa-calendar-alt',
      colorVariant: 'blue'
    },
    {
      id: 'buy-new',
      title: 'Buy a New Car',
      description: 'Purchase brand new vehicles',
      icon: 'fas fa-car',
      colorVariant: 'emerald'
    },
    {
      id: 'buy-used',
      title: 'Buy a Used Car',
      description: 'Quality pre-owned vehicles',
      icon: 'fas fa-car-side',
      colorVariant: 'red'
    }
  ];

  const cardColors = {
    blue: 'border-gray-200 hover:border-blue-500 hover:bg-blue-50/50',
    emerald: 'border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/50',
    red: 'border-gray-200 hover:border-red-500 hover:bg-red-50/50'
  };

  const iconColors = {
    blue: 'text-blue-600 bg-blue-100',
    emerald: 'text-emerald-600 bg-emerald-100',
    red: 'text-red-600 bg-red-100'
  };

  return (
    <div className="w-full text-center">
      <h3 className="text-2xl font-extrabold text-gray-900 mb-6">What are you looking for?</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            className={`flex flex-col items-center p-6 border-2 rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-1 ${cardColors[service.colorVariant]}`}
            onClick={() => onServiceSelect(service.id)}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4 transition-colors ${iconColors[service.colorVariant]}`}>
              <i className={service.icon}></i>
            </div>
            <h4 className="text-[1.1rem] font-bold text-gray-900 mb-2">{service.title}</h4>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceSelection;