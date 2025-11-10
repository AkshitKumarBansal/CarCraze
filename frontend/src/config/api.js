// API Configuration
const API_BASE_URL = 'http://localhost:5001';

export const API_ENDPOINTS = {
  // Auth endpoints
  SIGNIN: `${API_BASE_URL}/api/auth/signin`,
  SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  PROFILE: `${API_BASE_URL}/api/auth/profile`,
  
  // Car endpoints
  CARS: `${API_BASE_URL}/api/cars`,
  SELLER_CARS: `${API_BASE_URL}/api/seller/cars`,
  RENTALS: `${API_BASE_URL}/api/rentals`,
  UPLOAD_IMAGES: `${API_BASE_URL}/api/upload/car-images`,
  
  // Health check
  HEALTH: `${API_BASE_URL}/api/health`
};

export default API_BASE_URL;
