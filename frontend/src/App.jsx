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
import CustomerDashboard from './Components/Customer/CustomerDashboard';
import Profile from './Components/Profile/Profile';

const AppWithRouter = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();

  return (
    <div className="App">
      {/* ✅ Navbar always visible */}
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/signin"
          element={
            <SignIn
              onSwitchToSignUp={() => navigate('/signup')}
              onLoginSuccess={() => {
                localStorage.setItem('token', 'sample_token'); // replace with real token
                setIsLoggedIn(true);
                console.log("🔐 User Logged In -> isLoggedIn: ON");
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
                console.log("📝 User Signed Up & Logged In -> isLoggedIn: ON");
                navigate('/');
              }}
            />
          }
        />

        {/* Customer Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="customer">
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Profile Route */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute requiredRole="customer">
              <Profile />
            </ProtectedRoute>
          }
        />

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
      </Routes>
    </div>
  );
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Restore login state from localStorage
    if (localStorage.getItem("token")) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    console.log("✅ User login state:", isLoggedIn ? "ON (Logged In)" : "OFF (Logged Out)");
  }, [isLoggedIn]); // <-- Logs every time login state changes

  return (
    <Router>
      <AppWithRouter isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
    </Router>
  );
};

export default App;
