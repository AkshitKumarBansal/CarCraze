// If VITE_API_URL is not set, use an empty string for local development
// This allows the Vite proxy in vite.config.js to handle the requests.
// In production, VITE_API_URL will be your live domain (e.g., https://api.carcraze.com)
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const API_ENDPOINTS = {
  // Auth endpoints
  SIGNIN: `${API_BASE_URL}/api/auth/signin`,
  SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  PROFILE: `${API_BASE_URL}/api/user/profile`,
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

  WISHLIST: `${API_BASE_URL}/api/wishlist`, 
  ADMIN: `${API_BASE_URL}/api/admin`, 
  HEALTH: `${API_BASE_URL}/api/health` 
};

export default API_BASE_URL;