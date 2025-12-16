// API Configuration
// This file centralizes API endpoint configuration for the application

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    USER_BY_EMAIL: (email: string) => `${API_BASE_URL}/api/auth/user-by-email?email=${email}`,
  },
  
  // Studios endpoints
  STUDIOS: {
    BASE: `${API_BASE_URL}/api/studios`,
    BY_ID: (id: string | number) => `${API_BASE_URL}/api/studios/${id}`,
  },
  
  // Reservations endpoints
  RESERVATIONS: {
    BASE: `${API_BASE_URL}/api/reservations`,
    BY_ID: (id: string | number) => `${API_BASE_URL}/api/reservations/${id}`,
  },
  
  // Payments endpoints
  PAYMENTS: {
    BASE: `${API_BASE_URL}/api/payments`,
  },
  
  // Uploads endpoints
  UPLOADS: {
    STUDIO_IMAGES: `${API_BASE_URL}/api/uploads/studios/images`,
  },
  
  // Email endpoints
  EMAIL: {
    SEND: `${API_BASE_URL}/api/email/send-email`,
  },
};

export default API_BASE_URL;
