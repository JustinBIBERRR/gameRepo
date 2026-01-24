import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

// 获取 base URL，开发环境为 /，生产环境为 /gameRepo/
const base = import.meta.env.MODE === 'production' ? '/gameRepo/' : '/'

const router = createRouter({
  history: createWebHistory(base),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/city-guess',
      name: 'CityGuess',
      component: () => import('../views/CityGuess.vue')
    },
    {
      path: '/hero-guess',
      name: 'HeroGuess',
      component: () => import('../views/HeroGuess.vue')
    }
  ]
})

export default router
