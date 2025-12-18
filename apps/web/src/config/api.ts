// API Configuration
// This file centralizes API endpoint configuration for the application
// All API calls should use these endpoints instead of hardcoded URLs

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Frontend base URL for internal API routes
export const FRONTEND_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
    USER_BY_EMAIL: (email: string) => `${API_BASE_URL}/api/auth/user-by-email?email=${email}`,
  },
  
  // Studios endpoints
  STUDIOS: {
    BASE: `${API_BASE_URL}/api/studios`,
    BY_ID: (id: string | number) => `${API_BASE_URL}/api/studios/${id}`,
    MY_STUDIOS: `${API_BASE_URL}/api/studios/my-studios`,
    RESERVATIONS_BY_STUDIO: (id: string | number) => `${API_BASE_URL}/api/studios/${id}/reservations`,
  },
  
  // Reservations endpoints
  RESERVATIONS: {
    BASE: `${API_BASE_URL}/api/reservations`,
    BY_ID: (id: string | number) => `${API_BASE_URL}/api/reservations/${id}`,
    MY_RESERVATIONS: `${API_BASE_URL}/api/reservations/my-reservations`,
  },
  
  // Payments endpoints
  PAYMENTS: {
    BASE: `${API_BASE_URL}/api/payments`,
    STUDIO_PAYMENTS: `${API_BASE_URL}/api/payments/studio-payments`,
  },
  
  // Users endpoints
  USERS: {
    BASE: `${API_BASE_URL}/api/users`,
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

// Internal API routes (Next.js API routes)
export const INTERNAL_API = {
  BOOKINGS: {
    COMPLETE: `${FRONTEND_BASE_URL}/api/bookings/complete`,
  },
  RESERVATIONS: {
    BASE: `${FRONTEND_BASE_URL}/api/reservations`,
    CHECK: `${FRONTEND_BASE_URL}/api/reservations/check`,
  },
};

export default API_BASE_URL;
