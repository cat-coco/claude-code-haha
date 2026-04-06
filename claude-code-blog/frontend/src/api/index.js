import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

// Request interceptor - attach JWT token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor
api.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code === 200) return res.data
    if (res.code === 401) {
      localStorage.removeItem('token')
      window.location.href = '/admin/login'
    }
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

// ==================== Auth API ====================
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  getInfo: () => api.get('/auth/info'),
  updatePassword: (data) => api.post('/auth/password', data),
}

// ==================== Article API ====================
export const articleApi = {
  list: (params) => api.get('/article/list', { params }),
  detail: (id) => api.get(`/article/detail/${id}`),
  slug: (slug) => api.get(`/article/slug/${slug}`),
  recommended: (limit = 6) => api.get('/article/recommended', { params: { limit } }),
  byCategory: (categoryId, limit = 10) => api.get(`/article/category/${categoryId}`, { params: { limit } }),
  // Admin
  adminList: (params) => api.get('/admin/article/list', { params }),
  save: (data) => api.post('/admin/article/save', data),
  update: (id, data) => api.put(`/admin/article/update/${id}`, data),
  delete: (id) => api.delete(`/admin/article/delete/${id}`),
  toggleTop: (id) => api.post(`/admin/article/top/${id}`),
  toggleRecommend: (id) => api.post(`/admin/article/recommend/${id}`),
}

// ==================== Category API ====================
export const categoryApi = {
  list: () => api.get('/category/list'),
  tree: () => api.get('/category/tree'),
  detail: (id) => api.get(`/category/${id}`),
  save: (data) => api.post('/admin/category/save', data),
  update: (id, data) => api.put(`/admin/category/update/${id}`, data),
  delete: (id) => api.delete(`/admin/category/delete/${id}`),
}

// ==================== Tag API ====================
export const tagApi = {
  list: () => api.get('/tag/list'),
  detail: (id) => api.get(`/tag/${id}`),
  save: (data) => api.post('/admin/tag/save', data),
  update: (id, data) => api.put(`/admin/tag/update/${id}`, data),
  delete: (id) => api.delete(`/admin/tag/delete/${id}`),
}

// ==================== Comment API ====================
export const commentApi = {
  list: (articleId, params) => api.get(`/comment/list/${articleId}`, { params }),
  save: (data) => api.post('/comment/save', data),
  adminList: (params) => api.get('/admin/comment/list', { params }),
  approve: (id) => api.post(`/admin/comment/approve/${id}`),
  reject: (id) => api.post(`/admin/comment/reject/${id}`),
  delete: (id) => api.delete(`/admin/comment/delete/${id}`),
}

// ==================== Stats API ====================
export const statsApi = {
  dashboard: () => api.get('/admin/stats/dashboard'),
  daily: (params) => api.get('/admin/stats/daily', { params }),
  refresh: (date) => api.post('/admin/stats/refresh', null, { params: { date } }),
}

// ==================== Config API ====================
export const configApi = {
  site: () => api.get('/config/site'),
  list: () => api.get('/admin/config/list'),
  set: (key, value) => api.post('/admin/config/set', null, { params: { key, value } }),
}

// ==================== Visit API ====================
export const visitApi = {
  log: (data) => api.post('/visit/log', data),
}

// ==================== Upload API ====================
export const uploadApi = {
  image: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/admin/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

export default api
