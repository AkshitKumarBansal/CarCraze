// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const API_ENDPOINTS = {
  // Auth endpoints
  SIGNIN: `${API_BASE_URL}/api/auth/signin`,
  SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  PROFILE: `${API_BASE_URL}/api/auth/profile`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,

  // Car endpoints
  CARS: `${API_BASE_URL}/api/cars`,
  SELLER_CARS: `${API_BASE_URL}/api/seller/cars`,
  RENTALS: `${API_BASE_URL}/api/rentals`,
  // Cart endpoints
  CART: `${API_BASE_URL}/api/cart`,
  CART_CHECKOUT: `${API_BASE_URL}/api/cart/checkout`,
  ORDERS: `${API_BASE_URL}/api/orders`,
  UPLOAD_IMAGES: `${API_BASE_URL}/api/upload/car-images`,

  WISHLIST: `${API_BASE_URL}/api/wishlist`, // Wishlist endpoints
  ADMIN: `${API_BASE_URL}/api/admin`, // Admin endpoints
  HEALTH: `${API_BASE_URL}/api/health` // Health check endpoint
};

export default API_BASE_URL;
