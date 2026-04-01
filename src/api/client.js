import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    let detail =
      error.response?.data?.detail ||
      error.response?.data?.non_field_errors?.[0] ||
      error.message ||
      'Something went wrong.'

    if (error.code === 'ECONNABORTED') {
      detail = 'The server took too long to respond. It may be waking up from a cold start, so please try again.'
    }

    if (!error.response && error.message === 'Network Error') {
      detail = 'Unable to reach the server right now. Please check that the backend is running and CORS is configured.'
    }

    return Promise.reject(new Error(detail))
  },
)

export const authApi = {
  login: (payload) => api.post('/login', payload),
  register: (payload) => api.post('/register', payload),
}

export const foodApi = {
  restaurants: (params) => api.get('/restaurants', { params }),
  restaurantMenu: (id) => api.get(`/restaurants/${id}/menu`),
}

export const ordersApi = {
  create: (payload) => api.post('/orders', payload),
  listMine: () => api.get('/orders/user'),
  detail: (id) => api.get(`/orders/${id}`),
  tracking: (id) => api.get(`/orders/${id}/tracking`),
}

export const adminApi = {
  analytics: () => api.get('/admin/analytics'),
  orders: () => api.get('/admin/orders'),
  foodItems: () => api.get('/admin/food-items'),
  createFoodItem: (payload) => api.post('/admin/food-items', payload),
  updateFoodItem: (id, payload) => api.put(`/admin/food-items/${id}`, payload),
  deleteFoodItem: (id) => api.delete(`/admin/food-items/${id}`),
}
