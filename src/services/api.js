import axios from 'axios';

/** Prefer explicit env; otherwise use Vite proxy so phone/WiFi IP works. */
const apiBase = (import.meta.env.VITE_API_URL || '').trim() || '/api';

const api = axios.create({
  baseURL: apiBase,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Request failed';
    return Promise.reject({ ...error, message, details: error.response?.data?.details });
  }
);

export default api;

export const AuthAPI = {
  adminLogin: (data) => api.post('/auth/admin/login', data),
  customerLogin: (data) => api.post('/auth/customer/login', data),
  customerRegister: (data) => api.post('/auth/customer/register', data),
  adminProfile: () => api.get('/auth/admin/profile'),
  updateAdminProfile: (data) => api.put('/auth/admin/profile', data),
  me: () => api.get('/customers/me'),
};

export const ContentAPI = {
  settings: () => api.get('/settings'),
  categories: () => api.get('/categories'),
  services: (params) => api.get('/services', { params }),
  service: (id) => api.get(`/services/${id}`),
  serviceAvailability: (id) => api.get(`/services/${id}/availability`),
  packages: () => api.get('/packages'),
  package: (id) => api.get(`/packages/${id}`),
  packageAvailability: (id) => api.get(`/packages/${id}/availability`),
  banners: () => api.get('/banners'),
  activeDiscounts: () => api.get('/discounts/active'),
  validateDiscount: (data) => api.post('/discounts/validate', data),
  reviews: (params) => api.get('/reviews', { params }),
  createReview: (data) => api.post('/reviews', data),
  staff: (params) => api.get('/staff', { params }),
  staffOne: (id) => api.get(`/staff/${id}`),
  staffAvailability: (id, params) => api.get(`/staff/${id}/availability`, { params }),
  createAppointment: (data) => api.post('/appointments', data),
  myAppointments: (params) => api.get('/appointments/mine', { params }),
  lookupAppointments: (phone) => api.post('/appointments/lookup', { phone }),
  appointment: (id) => api.get(`/appointments/${id}`),
};

export const AdminAPI = {
  stats: () => api.get('/admin/dashboard/stats'),
  chart: (year) => api.get('/admin/dashboard/chart', { params: { year } }),
  monthlyChart: (year, month) => api.get('/admin/dashboard/monthly-chart', { params: { year, month } }),
  inProgress: (limit = 20) => api.get('/admin/dashboard/in-progress', { params: { limit } }),
  settings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  appointments: (params) => api.get('/admin/appointments', { params }),
  updateStatus: (id, status) => api.patch(`/admin/appointments/${id}/status`, { status }),
  daySlots: (params) => api.get('/admin/slots', { params }),
  nextSlot: (params) => api.get('/admin/slots/next', { params }),
  cancelDeskAppointment: (appointment_id) => api.post('/admin/slots/cancel', { appointment_id }),
  shiftDeskAppointment: (data) => api.post('/admin/slots/shift', data),
  slotBlocks: (params) => api.get('/admin/slot-blocks', { params }),
  blockSlot: (data) => api.post('/admin/slot-blocks', data),
  unblockSlot: (id) => api.delete(`/admin/slot-blocks/${id}`),
  unblockSlotByTime: (date, time, staff_id) =>
    api.delete('/admin/slot-blocks', { params: { date, time, staff_id } }),
  customers: (params) => api.get('/admin/customers', { params }),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  createService: (data) => api.post('/admin/services', data),
  updateService: (id, data) => api.put(`/admin/services/${id}`, data),
  deleteService: (id) => api.delete(`/admin/services/${id}`),
  staff: () => api.get('/admin/staff'),
  createStaff: (data) => api.post('/admin/staff', data),
  updateStaff: (id, data) => api.put(`/admin/staff/${id}`, data),
  deleteStaff: (id) => api.delete(`/admin/staff/${id}`),
  createPackage: (data) => api.post('/admin/packages', data),
  updatePackage: (id, data) => api.put(`/admin/packages/${id}`, data),
  deletePackage: (id) => api.delete(`/admin/packages/${id}`),
  createBanner: (data) => api.post('/admin/banners', data),
  updateBanner: (id, data) => api.put(`/admin/banners/${id}`, data),
  deleteBanner: (id) => api.delete(`/admin/banners/${id}`),
  discounts: () => api.get('/admin/discounts'),
  createDiscount: (data) => api.post('/admin/discounts', data),
  updateDiscount: (id, data) => api.put(`/admin/discounts/${id}`, data),
  deleteDiscount: (id) => api.delete(`/admin/discounts/${id}`),
  updateReview: (id, data) => api.patch(`/admin/reviews/${id}`, data),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),
  upload: (file, folder = 'media') => {
    const form = new FormData();
    form.append('image', file);
    form.append('folder', folder);
    return api.post('/admin/uploads', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};
