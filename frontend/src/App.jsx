import React from 'react';
import './index.css';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MessageProvider } from './context/MessageContext';
import { WishlistProvider } from './context/WishlistContext';
import { CompareProvider } from './context/CompareContext';

// Layout & Global Components
import Navbar from './Components/Layout/Navbar';
import Footer from './Components/Layout/Footer';
import MessageDisplay from './Components/Common/MessageDisplay';
import CompareBar from './Components/Common/CompareBar';
import ProtectedRoute from './Components/Auth/ProtectedRoute';

// Public & Auth Pages
import HomePage from './Pages/Home/HomePage';
import About from './Pages/Public/About';
import Contact from './Pages/Public/Contact';
import Service from './Pages/Public/Service';
import SignIn from './Pages/Auth/SignIn';
import SignUp from './Pages/Auth/SignUp';
import ForgotPassword from './Pages/Auth/ForgotPassword';
import ResetPassword from './Pages/Auth/ResetPassword';

// Customer Pages
import CustomerDashboard from './Pages/Customer/CustomerDashboard';
import NewCars from './Pages/Customer/NewCars';
import OldCars from './Pages/Customer/OldCars';
import RentalCars from './Pages/Customer/RentalCars';
import CarDetail from './Pages/Customer/CarDetail';
import CustomerCart from './Pages/Customer/CustomerCart';
import CustomerOrders from './Pages/Customer/CustomerOrders';
import Wishlist from './Pages/Customer/Wishlist';
import ComparePage from './Pages/Customer/ComparePage';

// Seller Pages
import SellerDashboard from './Pages/Seller/SellerDashboard';
import AddCar from './Pages/Seller/AddCar';
import EditCar from './Pages/Seller/EditCar';

// Admin Pages
import AdminDashboard from './Pages/Admin/AdminDashboard';
import UserManagement from './Pages/Admin/UserManagement';
import UserDetail from './Pages/Admin/UserDetail';
import VerificationManager from './Pages/Admin/VerificationManager';

// Profile Page
import Profile from './Pages/Profile/Profile';

// Bug #12 fix: isLoggedIn is now derived from AuthContext (no more fake sentinel token).
const AppWithRouter = () => {
  const navigate = useNavigate();
  const { user, refreshAuth } = useAuth();
  const isLoggedIn = !!user;

  return (
    <div className="text-left pt-[80px] pb-0 min-h-screen flex flex-col">
      <Navbar isLoggedIn={isLoggedIn} />
      <MessageDisplay />
      
      <main className="flex-grow">
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
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute requiredRole="customer">
                <Wishlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/compare"
            element={
              <ProtectedRoute requiredRole="customer">
                <ComparePage />
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

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/users/:userId" element={<ProtectedRoute requiredRole="admin"><UserDetail /></ProtectedRoute>} />
          <Route path="/admin/verifications" element={<ProtectedRoute requiredRole="admin"><VerificationManager /></ProtectedRoute>} />
        </Routes>
      </main>
      
      <CompareBar />
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <WishlistProvider>
        <MessageProvider>
          <CompareProvider>
            <Router>
              <AppWithRouter />
            </Router>
          </CompareProvider>
        </MessageProvider>
      </WishlistProvider>
    </AuthProvider>
  );
};

export default App;