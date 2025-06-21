import axios from 'axios';

// Configuration de base d'Axios
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Timeout de 10 secondes
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🚀 Requête API:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Erreur de requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => {
    console.log('✅ Réponse API:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Erreur de réponse:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    if (error.response?.status === 500) {
      console.error('Erreur serveur:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

// Services des espaces
export const spaceService = {
  getAll: (params = {}) => api.get('/spaces', { params }),
  getById: (id) => api.get(`/spaces/${id}`),
  create: (spaceData) => axios.post(`${API_BASE_URL}/spaces`, spaceData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
      // Ne pas fixer Content-Type ici, axios le gère pour FormData
    }
  }),
  update: (id, spaceData) => api.put(`/spaces/${id}`, spaceData),
  delete: (id) => api.delete(`/spaces/${id}`),
  uploadImage: (id, formData) => api.post(`/spaces/${id}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getCategories: () => api.get('/spaces/categories'),
  getAmenities: () => api.get('/spaces/amenities'),
  search: (query) => api.get('/spaces/search', { params: query }),
};

// Services des réservations
export const bookingService = {
  getAll: (params = {}) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (bookingData) => api.post('/bookings', bookingData),
  update: (id, bookingData) => api.put(`/bookings/${id}`, bookingData),
  delete: (id) => api.delete(`/bookings/${id}`),
  getBySpace: (spaceId) => api.get(`/bookings/space/${spaceId}`),
  getByUser: (userId) => api.get(`/bookings`),
  cancel: (id) => api.put(`/bookings/${id}/status`, { status: 'CANCELLED' }),
  confirm: (id) => api.put(`/bookings/${id}/status`, { status: 'CONFIRMED' }),
  getAvailability: (spaceId, date) => api.get(`/bookings/availability/${spaceId}`, { params: { date } }),
};

// Services des utilisateurs (Admin)
export const userService = {
  getAll: (params = {}) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  activate: (id) => api.put(`/users/${id}/activate`),
  deactivate: (id) => api.put(`/users/${id}/deactivate`),
  getBookings: (id) => api.get(`/users/${id}/bookings`),
  getStats: (id) => api.get(`/users/${id}/stats`),
};

// Services des statistiques (Admin)
export const statsService = {
  getDashboard: () => api.get('/stats/dashboard'),
  getSpaces: () => api.get('/stats/spaces'),
  getUsers: () => api.get('/stats/users'),
  getBookings: (params = {}) => api.get('/stats/bookings', { params }),
  getRevenue: (params = {}) => api.get('/stats/revenue', { params }),
  getPopularSpaces: () => api.get('/stats/popular-spaces'),
  getActiveUsers: () => api.get('/stats/active-users'),
  exportData: (type, params = {}) => api.get(`/stats/export/${type}`, { 
    params,
    responseType: 'blob'
  }),
};

// Services des notifications
export const notificationService = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  sendEmail: (data) => api.post('/notifications/send-email', data),
  sendSMS: (data) => api.post('/notifications/send-sms', data),
  
  // Notifications spécifiques aux réservations
  bookingNotifications: {
    sendBookingModification: (bookingId, data) => 
      api.post(`/notifications/booking/${bookingId}/modification`, data),
    
    sendBookingConfirmation: (bookingId) => 
      api.post(`/notifications/booking/${bookingId}/confirmation`),
    
    sendBookingCancellation: (bookingId, reason) => 
      api.post(`/notifications/booking/${bookingId}/cancellation`, { reason }),
    
    sendReminderEmail: (bookingId) => 
      api.post(`/notifications/booking/${bookingId}/reminder`),
  }
};

// Services des paiements
export const paymentService = {
  createPaymentIntent: (bookingId) => api.post(`/payments/create-intent/${bookingId}`),
  confirmPayment: (paymentIntentId) => api.post('/payments/confirm', { paymentIntentId }),
  getPaymentHistory: (params = {}) => api.get('/payments/history', { params }),
  refundPayment: (paymentId, amount) => api.post(`/payments/${paymentId}/refund`, { amount }),
  getPaymentMethods: () => api.get('/payments/methods'),
  addPaymentMethod: (paymentMethod) => api.post('/payments/methods', paymentMethod),
  removePaymentMethod: (methodId) => api.delete(`/payments/methods/${methodId}`),
};

// Services des fichiers
export const fileService = {
  upload: (file, type = 'image') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (fileId) => api.delete(`/files/${fileId}`),
  getSignedUrl: (fileId) => api.get(`/files/${fileId}/signed-url`),
};

export default api; 