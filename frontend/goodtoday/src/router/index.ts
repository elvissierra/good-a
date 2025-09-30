import { createRouter, createWebHistory } from '@ionic/vue-router'
import Home from '@/components/Home.vue'
import Insights from '@/components/Insights.vue'
import LoginView from '@/views/LoginView.vue'
import CheckinsView from '@/views/CheckinsView.vue'
import { setupGuards } from './guard'

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/home', component: Home },
  { path: '/insights', component: Insights },
  { path: '/login', component: LoginView },
  { path: '/checkins', component: CheckinsView },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

setupGuards(router)

export default router
