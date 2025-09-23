import { useState } from 'react';
import '/src/index.css';

const SearchForm = ({ onSearch, serviceType }) => {
  const [searchData, setSearchData] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    startDate: '',
    returnDate: '',
    carType: '',
    maxBudget: 100,
    passengers: 1,
    transmission: ''
  });

  const handleInputChange = (e) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value
    });
  };

  const handleBudgetChange = (e) => {
    setSearchData({
      ...searchData,
      maxBudget: parseInt(e.target.value)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Search data:', searchData);
    if (onSearch) {
      onSearch({ ...searchData, serviceType });
    }
  };

  const getFormTitle = () => {
    switch(serviceType) {
      case 'rent': return 'Find Your Rental Car';
      case 'buy-new': return 'Find Your New Car';
      case 'buy-used': return 'Find Your Used Car';
      default: return 'Find Your Perfect Car';
    }
  };

  const getFormFields = () => {
    if (serviceType === 'rent') {
      return (
        <>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pickupLocation">Pickup Location</label>
              <input
                type="text"
                id="pickupLocation"
                name="pickupLocation"
                placeholder="Enter pickup location"
                value={searchData.pickupLocation}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="dropoffLocation">Drop-off Location</label>
              <input
                type="text"
                id="dropoffLocation"
                name="dropoffLocation"
                placeholder="Enter drop-off location"
                value={searchData.dropoffLocation}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={searchData.startDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="returnDate">Return Date</label>
              <input
                type="date"
                id="returnDate"
                name="returnDate"
                value={searchData.returnDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </>
      );
    } else {
      return (
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="location">Your Location</label>
            <input
              type="text"
              id="location"
              name="location"
              placeholder="Enter your city"
              value={searchData.location || ''}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group budget-group">
            <label htmlFor="maxBudget">Maximum Budget: ${searchData.maxBudget * (serviceType === 'buy-new' ? 500 : serviceType === 'buy-used' ? 200 : 1)}{serviceType === 'rent' ? '/day' : ''}</label>
            <input
              type="range"
              id="maxBudget"
              name="maxBudget"
              min={serviceType === 'rent' ? "25" : "50"}
              max={serviceType === 'buy-new' ? "200" : serviceType === 'buy-used' ? "150" : "200"}
              value={searchData.maxBudget}
              onChange={handleBudgetChange}
              className="budget-slider"
            />
            <div className="budget-range">
              <span>${serviceType === 'rent' ? '25' : serviceType === 'buy-new' ? '25,000' : '10,000'}</span>
              <span>${serviceType === 'rent' ? '200' : serviceType === 'buy-new' ? '100,000' : '30,000'}</span>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <h3 className="booking-title">{getFormTitle()}</h3>
      
      {getFormFields()}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="carType">Car Type</label>
          <select
            id="carType"
            name="carType"
            value={searchData.carType}
            onChange={handleInputChange}
          >
            <option value="">Any Type</option>
            <option value="economy">Economy</option>
            <option value="compact">Compact</option>
            <option value="midsize">Mid-size</option>
            <option value="luxury">Luxury</option>
            <option value="suv">SUV</option>
            <option value="electric">Electric</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="transmission">Transmission</label>
          <select
            id="transmission"
            name="transmission"
            value={searchData.transmission}
            onChange={handleInputChange}
          >
            <option value="">Any Transmission</option>
            <option value="automatic">Automatic</option>
            <option value="manual">Manual</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="passengers">Number of Passengers</label>
          <select
            id="passengers"
            name="passengers"
            value={searchData.passengers}
            onChange={handleInputChange}
          >
            <option value="1">1 Passenger</option>
            <option value="2">2 Passengers</option>
            <option value="4">4 Passengers</option>
            <option value="5">5 Passengers</option>
            <option value="7">7+ Passengers</option>
          </select>
        </div>
      </div>

      <button type="submit" className="search-btn">
        <i className="fas fa-search"></i> {serviceType === 'rent' ? 'Find Available Cars' : 'Search Cars'}
      </button>
    </form>
  );
};

export default SearchForm;
