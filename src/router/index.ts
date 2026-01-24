import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const router = createRouter({
  history: createWebHistory(),
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
