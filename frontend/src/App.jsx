import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import HomePage from './Components/Home/HomePage';
import SignIn from './Components/LoginDetails/SignIn';
import SignUp from './Components/LoginDetails/SignUp';
import ProtectedRoute from './Components/Auth/ProtectedRoute';
import Navbar from './Components/Common/Navbar';
import SellerDashboard from './Components/Seller/SellerDashboard';
import AddCar from './Components/Seller/AddCar';
import EditCar from './Components/Seller/EditCar';
import CustomerDashboard from './Components/Customer/CustomerDashboard';
import Profile from './Components/Profile/Profile';
import NewCars from './Components/Customer/NewCars';
import OldCars from './Components/Customer/OldCars';
import RentalCars from './Components/Customer/RentalCars';
import CustomerCart from './Components/Customer/CustomerCart';
import CustomerOrders from './Components/Customer/CustomerOrders';
import About from './Components/Common/About';
import Contact from './Components/Common/Contact';
import Service from './Components/Common/Service';
import Footer from './Components/Common/Footer';

const AppWithRouter = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();

  return (
    <div className="App">
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/signin"
          element={
            <SignIn
              onSwitchToSignUp={() => navigate('/signup')}
              onLoginSuccess={() => {
                localStorage.setItem('token', 'sample_token');
                setIsLoggedIn(true);
                console.log(" User Logged In -> isLoggedIn: ON");
                navigate('/');
              }}
            />
          }
        />
        <Route
          path="/signup"
          element={
            <SignUp
              onSwitchToSignIn={() => navigate('/signin')}
              onSignupSuccess={() => {
                localStorage.setItem('token', 'sample_token');
                setIsLoggedIn(true);
                console.log(" User Signed Up & Logged In -> isLoggedIn: ON");
                navigate('/');
              }}
            />
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="customer">
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/new-cars"
          element={
            <ProtectedRoute requiredRole="customer">
              <NewCars />
            </ProtectedRoute>
          }
        />
        <Route
          path="/old-cars"
          element={
            <ProtectedRoute requiredRole="customer">
              <OldCars />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rent-cars"
          element={
            <ProtectedRoute requiredRole="customer">
              <RentalCars />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute requiredRole="customer">
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute requiredRole="customer">
              <CustomerCart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute requiredRole="customer">
              <CustomerOrders />
            </ProtectedRoute>
          }
        />

        {/* Services Route */}
        <Route path="/services" element={<Service />} />

        {/* About Route */}
        <Route path="/about" element={<About />} />

        {/* Contact Route */}
        <Route path="/contact" element={<Contact />} />

        {/* Seller Routes */}
        <Route
          path="/seller/dashboard"
          element={
            <ProtectedRoute requiredRole="seller">
              <SellerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/add-car"
          element={
            <ProtectedRoute requiredRole="seller">
              <AddCar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/edit-car/:carId"
          element={
            <ProtectedRoute requiredRole="seller">
              <EditCar />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
    </div>
  );
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    if (localStorage.getItem("token")) {
      setIsLoggedIn(true);
    }
  }, []);
  useEffect(() => {
    console.log(" User login state:", isLoggedIn ? "ON (Logged In)" : "OFF (Logged Out)");
  }, [isLoggedIn]);
  return (
    <Router>
      <AppWithRouter isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
    </Router>
  );
};

export default App;
