

import type { Router } from 'vue-router'
import { isAuthenticated } from '@/stores/sessions'

// Define which routes require auth
const PROTECTED_PATHS = new Set(['/home', '/insights', '/checkins'])

export function setupGuards(router: Router) {
  router.beforeEach((to) => {
    if (PROTECTED_PATHS.has(to.path) && !isAuthenticated.value) {
      return { path: '/login', query: { next: to.fullPath } }
    }
    return true
  })
}