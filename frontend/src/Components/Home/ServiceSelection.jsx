import '/src/index.css';

const ServiceSelection = ({ onServiceSelect, onClose }) => {
  const services = [
    {
      id: 'rent',
      title: 'Rent a Car',
      description: 'Short-term rental for your travel needs',
      icon: 'fas fa-calendar-alt',
      color: '#2563eb'
    },
    {
      id: 'buy-new',
      title: 'Buy a New Car',
      description: 'Purchase brand new vehicles',
      icon: 'fas fa-car',
      color: '#059669'
    },
    {
      id: 'buy-used',
      title: 'Buy a Used Car',
      description: 'Quality pre-owned vehicles',
      icon: 'fas fa-car-side',
      color: '#dc2626'
    }
  ];

  return (
    <div className="service-selection">
      <h3 className="service-title">What are you looking for?</h3>
      <div className="service-options">
        {services.map((service) => (
          <div
            key={service.id}
            className="service-option"
            onClick={() => onServiceSelect(service.id)}
            style={{ borderColor: service.color }}
          >
            <div className="service-icon" style={{ color: service.color }}>
              <i className={service.icon}></i>
            </div>
            <h4>{service.title}</h4>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceSelection;
