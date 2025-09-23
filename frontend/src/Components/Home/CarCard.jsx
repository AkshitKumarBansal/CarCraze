import '/src/index.css';

const CarCard = ({ car }) => {
  const formatPrice = (price, category) => {
    if (category === 'rent') {
      return `$${price}/day`;
    } else {
      return `$${price.toLocaleString()}`;
    }
  };

  const getButtonText = (category) => {
    switch(category) {
      case 'rent': return 'Book Now';
      case 'buy-new': return 'Buy New';
      case 'buy-used': return 'Buy Used';
      default: return 'View Details';
    }
  };

  return (
    <div className="car-card">
      <div className="car-image">
        <i className={car.icon}></i>
      </div>
      <div className="car-info">
        <h3 className="car-name">{car.name}</h3>
        <div className="car-features">
          <span><i className="fas fa-users"></i> {car.seats} seats</span>
          <span><i className="fas fa-cog"></i> {car.transmission}</span>
          <span><i className="fas fa-gas-pump"></i> {car.fuel}</span>
        </div>
        <div className="car-price">
          {formatPrice(car.price, car.category)}
        </div>
        <button className="btn btn-primary" style={{width: '100%'}}>
          {getButtonText(car.category)}
        </button>
      </div>
    </div>
  );
};

export default CarCard;
