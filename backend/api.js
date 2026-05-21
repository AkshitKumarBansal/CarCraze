const API_BASE_URL = 'http://localhost:5001';

export const API_ENDPOINTS = {
  SIGNIN: `${API_BASE_URL}/api/auth/signin`,
  SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  PROFILE: `${API_BASE_URL}/api/auth/profile`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
  CARS: `${API_BASE_URL}/api/cars`,
  SELLER_CARS: `${API_BASE_URL}/api/seller/cars`,
  RENTALS: `${API_BASE_URL}/api/rentals`,
  CART: `${API_BASE_URL}/api/cart`,
  ORDERS: `${API_BASE_URL}/api/orders`,
  ADMIN: `${API_BASE_URL}/api/admin`,
};