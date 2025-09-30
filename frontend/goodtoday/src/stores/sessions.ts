

import { ref, computed } from 'vue'

const TOKEN_KEY = 'gooda_access_token'
const EMAIL_KEY = 'gooda_user_email'

const accessToken = ref<string | null>(localStorage.getItem(TOKEN_KEY))
const userEmail = ref<string | null>(localStorage.getItem(EMAIL_KEY))

export const isAuthenticated = computed(() => !!accessToken.value)

export function setSession(token: string, email?: string) {
  accessToken.value = token
  localStorage.setItem(TOKEN_KEY, token)
  if (email) {
    userEmail.value = email
    localStorage.setItem(EMAIL_KEY, email)
  }
}

export function clearSession() {
  accessToken.value = null
  userEmail.value = null
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EMAIL_KEY)
}

export function getAccessToken() {
  return accessToken.value
}

export function getUserEmail() {
  return userEmail.value
}