import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import { MessageProvider } from './Components/Message/MessageContext';
import MessageDisplay from './Components/Message/MessageDisplay';
import AdminDashboard from './Components/Admin/AdminDashboard';
import CarDetail from './Components/Customer/CarDetail';

import ForgotPassword from './Components/LoginDetails/ForgotPassword';
import ResetPassword from './Components/LoginDetails/ResetPassword';

// Bug #12 fix: isLoggedIn is now derived from AuthContext (no more fake sentinel token).
const AppWithRouter = () => {
  const navigate = useNavigate();
  const { user, refreshAuth } = useAuth();
  const isLoggedIn = !!user;

  return (
    <div className="App">
      <Navbar isLoggedIn={isLoggedIn} />
      <MessageDisplay />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/signin"
          element={
            <SignIn
              onSwitchToSignUp={() => navigate('/signup')}
              onLoginSuccess={refreshAuth}
            />
          }
        />
        <Route
          path="/signup"
          element={
            <SignUp
              onSwitchToSignIn={() => navigate('/signin')}
              onSignupSuccess={refreshAuth}
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
          path="/cars/:carId"
          element={
            <ProtectedRoute requiredRole="customer">
              <CarDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
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

        {/* Public Routes */}
        <Route path="/services" element={<Service />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

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

        {/* Bug #1 fix: Admin route now exists */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <MessageProvider>
        <Router>
          <AppWithRouter />
        </Router>
      </MessageProvider>
    </AuthProvider>
  );
};

export default App;
