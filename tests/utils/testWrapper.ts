import { mount, type MountingOptions } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import type { Component } from 'vue'

// 创建测试用的路由
export function createTestRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/city-guess', component: { template: '<div>CityGuess</div>' } },
      { path: '/hero-guess', component: { template: '<div>HeroGuess</div>' } },
      { path: '/movie-guess', component: { template: '<div>MovieGuess</div>' } },
      { path: '/settings', component: { template: '<div>Settings</div>' } }
    ]
  })
}

// 创建测试包装器
export function createTestWrapper<T extends Component>(
  component: T,
  options: MountingOptions<T> = {}
) {
  const router = createTestRouter()
  
  return mount(component, {
    global: {
      plugins: [router],
      stubs: {
        // 可以在这里添加需要 stub 的组件
      }
    },
    ...options
  })
}
