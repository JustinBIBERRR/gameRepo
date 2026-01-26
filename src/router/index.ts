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
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('../views/Settings.vue')
    },
    {
      path: '/settings/city',
      name: 'CitySettings',
      component: () => import('../views/GameSettings/CitySettings.vue')
    },
    {
      path: '/settings/hero',
      name: 'HeroSettings',
      component: () => import('../views/GameSettings/HeroSettings.vue')
    },
    {
      path: '/settings/movie',
      name: 'MovieSettings',
      component: () => import('../views/GameSettings/MovieSettings.vue')
    },
    {
      path: '/movie-guess',
      name: 'MovieGuess',
      component: () => import('../views/MovieGuess.vue')
    }
  ]
})

export default router
