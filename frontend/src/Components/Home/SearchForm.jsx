import { useState } from 'react';

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

  const inputClasses = "w-full p-3 border-2 border-gray-200 rounded-xl text-[0.9rem] text-gray-800 bg-white transition-all focus:outline-none focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/15";
  const labelClasses = "block text-[0.8rem] font-semibold text-gray-700 mb-1.5";

  const getFormFields = () => {
    if (serviceType === 'rent') {
      return (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col">
              <label htmlFor="pickupLocation" className={labelClasses}>Pickup Location</label>
              <input
                type="text"
                id="pickupLocation"
                name="pickupLocation"
                placeholder="Enter pickup location"
                value={searchData.pickupLocation}
                onChange={handleInputChange}
                className={inputClasses}
                required
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="dropoffLocation" className={labelClasses}>Drop-off Location</label>
              <input
                type="text"
                id="dropoffLocation"
                name="dropoffLocation"
                placeholder="Enter drop-off location"
                value={searchData.dropoffLocation}
                onChange={handleInputChange}
                className={inputClasses}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col">
              <label htmlFor="startDate" className={labelClasses}>Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={searchData.startDate}
                onChange={handleInputChange}
                className={inputClasses}
                required
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="returnDate" className={labelClasses}>Return Date</label>
              <input
                type="date"
                id="returnDate"
                name="returnDate"
                value={searchData.returnDate}
                onChange={handleInputChange}
                className={inputClasses}
                required
              />
            </div>
          </div>
        </>
      );
    } else {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col">
            <label htmlFor="location" className={labelClasses}>Your Location</label>
            <input
              type="text"
              id="location"
              name="location"
              placeholder="Enter your city"
              value={searchData.location || ''}
              onChange={handleInputChange}
              className={inputClasses}
              required
            />
          </div>
          <div className="flex flex-col justify-center">
            <label htmlFor="maxBudget" className={labelClasses}>
              Maximum Budget: ${searchData.maxBudget * (serviceType === 'buy-new' ? 500 : serviceType === 'buy-used' ? 200 : 1)}{serviceType === 'rent' ? '/day' : ''}
            </label>
            <input
              type="range"
              id="maxBudget"
              name="maxBudget"
              min={serviceType === 'rent' ? "25" : "50"}
              max={serviceType === 'buy-new' ? "200" : serviceType === 'buy-used' ? "150" : "200"}
              value={searchData.maxBudget}
              onChange={handleBudgetChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
            />
            <div className="flex justify-between text-xs text-gray-500 font-medium mt-2">
              <span>${serviceType === 'rent' ? '25' : serviceType === 'buy-new' ? '25,000' : '10,000'}</span>
              <span>${serviceType === 'rent' ? '200' : serviceType === 'buy-new' ? '100,000' : '30,000'}</span>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <form className="flex flex-col w-full text-left" onSubmit={handleSubmit}>
      <h3 className="text-2xl font-extrabold text-gray-900 mb-6 text-center">{getFormTitle()}</h3>
      
      {getFormFields()}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col">
          <label htmlFor="carType" className={labelClasses}>Car Type</label>
          <select
            id="carType"
            name="carType"
            value={searchData.carType}
            onChange={handleInputChange}
            className={inputClasses}
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
        <div className="flex flex-col">
          <label htmlFor="transmission" className={labelClasses}>Transmission</label>
          <select
            id="transmission"
            name="transmission"
            value={searchData.transmission}
            onChange={handleInputChange}
            className={inputClasses}
          >
            <option value="">Any Transmission</option>
            <option value="automatic">Automatic</option>
            <option value="manual">Manual</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="flex flex-col">
          <label htmlFor="passengers" className={labelClasses}>Number of Passengers</label>
          <select
            id="passengers"
            name="passengers"
            value={searchData.passengers}
            onChange={handleInputChange}
            className={inputClasses}
          >
            <option value="1">1 Passenger</option>
            <option value="2">2 Passengers</option>
            <option value="4">4 Passengers</option>
            <option value="5">5 Passengers</option>
            <option value="7">7+ Passengers</option>
          </select>
        </div>
      </div>

      <button 
        type="submit" 
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2 text-[1rem]"
      >
        <i className="fas fa-search"></i> {serviceType === 'rent' ? 'Find Available Cars' : 'Search Cars'}
      </button>
    </form>
  );
};

export default SearchForm;