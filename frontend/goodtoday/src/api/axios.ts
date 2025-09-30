

import axios from 'axios'
import { getAccessToken, clearSession } from '@/stores/sessions'
import router from '@/router'

const baseURL = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'

export const api = axios.create({ baseURL })

// Attach token on each request
api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// Handle 401s globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      clearSession()
      if (router.currentRoute.value.path !== '/login') router.replace('/login')
    }
    return Promise.reject(err)
  }
)

export default api