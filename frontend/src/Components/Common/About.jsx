import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen pt-20 bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white py-16 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About CarCraze</h1>
          <p className="text-lg md:text-xl opacity-90">Your trusted partner in finding the perfect car</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          
          {/* Our Story */}
          <section className="mb-16">
            <h2 className="text-3xl md:text-4xl text-gray-800 font-semibold mb-8 text-center">Our Story</h2>
            <p className="text-lg leading-relaxed text-gray-600 max-w-3xl mx-auto text-center">
              CarCraze was founded with a simple mission: to make car buying, selling, and renting 
              as easy and transparent as possible. We believe that everyone deserves access to 
              quality vehicles at fair prices, whether you're looking to buy your first car, 
              upgrade to a newer model, or rent a vehicle for your next adventure.
            </p>
          </section>

          {/* Our Mission */}
          <section className="mb-16">
            <h2 className="text-3xl md:text-4xl text-gray-800 font-semibold mb-8 text-center">Our Mission</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
              
              {/* Mission Card 1 */}
              <div className="bg-white p-8 rounded-xl text-center shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl text-white">
                  <i className="fas fa-handshake"></i>
                </div>
                <h3 className="text-2xl text-gray-800 font-semibold mb-4">Trust & Transparency</h3>
                <p className="text-gray-600 leading-relaxed text-center">We provide honest, detailed information about every vehicle on our platform.</p>
              </div>

              {/* Mission Card 2 */}
              <div className="bg-white p-8 rounded-xl text-center shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl text-white">
                  <i className="fas fa-search"></i>
                </div>
                <h3 className="text-2xl text-gray-800 font-semibold mb-4">Easy Discovery</h3>
                <p className="text-gray-600 leading-relaxed text-center">Find the perfect car with our intuitive search and filtering tools.</p>
              </div>

              {/* Mission Card 3 */}
              <div className="bg-white p-8 rounded-xl text-center shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl text-white">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <h3 className="text-2xl text-gray-800 font-semibold mb-4">Quality Assurance</h3>
                <p className="text-gray-600 leading-relaxed text-center">Every vehicle is thoroughly inspected to ensure quality and reliability.</p>
              </div>

            </div>
          </section>

          {/* Why Choose Us */}
          <section className="mb-16">
            <h2 className="text-3xl md:text-4xl text-gray-800 font-semibold mb-8 text-center">Why Choose CarCraze?</h2>
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center py-4 border-b border-gray-200">
                <i className="fas fa-check-circle text-green-500 text-xl mr-4 min-w-[20px]"></i>
                <span className="text-lg text-gray-800">Extensive inventory of new, used, and rental cars</span>
              </div>
              <div className="flex items-center py-4 border-b border-gray-200">
                <i className="fas fa-check-circle text-green-500 text-xl mr-4 min-w-[20px]"></i>
                <span className="text-lg text-gray-800">Verified sellers and transparent pricing</span>
              </div>
              <div className="flex items-center py-4 border-b border-gray-200">
                <i className="fas fa-check-circle text-green-500 text-xl mr-4 min-w-[20px]"></i>
                <span className="text-lg text-gray-800">Easy online booking and reservation system</span>
              </div>
              <div className="flex items-center py-4 border-b border-gray-200">
                <i className="fas fa-check-circle text-green-500 text-xl mr-4 min-w-[20px]"></i>
                <span className="text-lg text-gray-800">24/7 customer support</span>
              </div>
              <div className="flex items-center py-4">
                <i className="fas fa-check-circle text-green-500 text-xl mr-4 min-w-[20px]"></i>
                <span className="text-lg text-gray-800">Secure payment processing</span>
              </div>
            </div>
          </section>

          {/* Our Services */}
          <section className="mb-16">
            <h2 className="text-3xl md:text-4xl text-gray-800 font-semibold mb-8 text-center">Our Services</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              
              <div className="bg-gray-50 p-8 rounded-lg text-center border-l-4 border-blue-500">
                <h3 className="text-xl text-gray-800 font-semibold mb-4">Buy New Cars</h3>
                <p className="text-gray-600 leading-relaxed m-0">Browse the latest models from top brands with full warranty coverage.</p>
              </div>
              
              <div className="bg-gray-50 p-8 rounded-lg text-center border-l-4 border-blue-500">
                <h3 className="text-xl text-gray-800 font-semibold mb-4">Buy Used Cars</h3>
                <p className="text-gray-600 leading-relaxed m-0">Quality pre-owned vehicles thoroughly inspected and certified.</p>
              </div>
              
              <div className="bg-gray-50 p-8 rounded-lg text-center border-l-4 border-blue-500">
                <h3 className="text-xl text-gray-800 font-semibold mb-4">Car Rentals</h3>
                <p className="text-gray-600 leading-relaxed m-0">Short-term and long-term rental options for all your travel needs.</p>
              </div>

            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default About;