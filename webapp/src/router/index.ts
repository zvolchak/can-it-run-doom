import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/DbView.vue'
import BountyView from '@/views/BountyView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/bounty',
      name: 'bounty',
      component: BountyView
    },
  ]
})

export default router
