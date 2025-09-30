

import api from './axios'
import { setSession } from '@/stores/sessions'

export async function login(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password })
  // expecting { access_token: string }
  if (!data?.access_token) throw new Error('Login response missing access_token')
  setSession(data.access_token, email)
  return data
}