<template>
  <nav class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <router-link to="/" class="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
            {{ t('nav.platformName') }}
          </router-link>
        </div>
        <div class="flex items-center gap-2">
          <!-- 语言切换 -->
          <div class="flex items-center rounded-md border border-gray-200 overflow-hidden">
            <button
              type="button"
              :class="locale === 'zh-CN' ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-600 hover:bg-gray-50'"
              class="px-2.5 py-1.5 text-sm font-medium transition-colors"
              @click="setLocale('zh-CN')"
            >
              {{ t('nav.langZh') }}
            </button>
            <button
              type="button"
              :class="locale === 'en' ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-600 hover:bg-gray-50'"
              class="px-2.5 py-1.5 text-sm font-medium transition-colors"
              @click="setLocale('en')"
            >
              {{ t('nav.langEn') }}
            </button>
          </div>
          <!-- 管理入口（仅显示齿轮图标） -->
          <router-link
            to="/settings"
            class="text-gray-700 hover:bg-gray-100 p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            :class="{ 'bg-gray-100': route.path.startsWith('/settings') }"
            :title="t('nav.settingsTitle')"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </router-link>
          
          <!-- 游戏选择下拉菜单（仅显示图标） -->
          <div class="relative" ref="dropdownRef">
            <button
              @click="toggleDropdown"
              class="text-gray-700 hover:bg-gray-100 p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              :class="{ 'bg-gray-100': isDropdownOpen || isAnyGameActive }"
              :title="t('nav.gameSelectTitle')"
            >
              <component :is="currentGameIcon" class="!w-5 !h-5" />
            </button>
            
            <!-- 下拉菜单 -->
            <Transition name="dropdown">
              <div
                v-if="isDropdownOpen"
                class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                @click.stop
              >
                <router-link
                  v-for="game in games"
                  :key="game.path"
                  :to="game.path"
                  @click="closeDropdown"
                  class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  :class="{ 'bg-gray-100': isActive(game.path) }"
                >
                  <component :is="game.icon" class="!w-5 !h-5 flex-shrink-0" />
                  <span>{{ t(game.title) }}</span>
                </router-link>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { setSavedLocale } from '../locales'
import { allGamesConfig } from '../config/games'
import { getGameVisibility } from '../utils/storageUtils'

const route = useRoute()
const dropdownRef = ref<HTMLElement | null>(null)
const isDropdownOpen = ref(false)

const { t, locale } = useI18n()

function setLocale(lang: string) {
  locale.value = lang
  setSavedLocale(lang)
}

// 根据可见性配置过滤游戏，并转换为导航需要的格式
const games = computed(() => {
  const visibility = getGameVisibility()
  return allGamesConfig
    .filter(game => visibility[game.gameType])
    .map(game => ({
      title: game.title,
      path: game.path,
      icon: () => game.icon()
    }))
})

function isActive(path: string) {
  return route.path === path
}

// 检查是否有任何游戏处于激活状态
const isAnyGameActive = computed(() => {
  return games.value.some(game => isActive(game.path))
})

// 获取当前激活游戏的图标，如果没有则显示默认图标
const currentGameIcon = computed(() => {
  const activeGame = games.value.find(game => isActive(game.path))
  if (activeGame) {
    return activeGame.icon
  }
  // 默认显示一个游戏图标
  return () => h('svg', {
    class: 'w-5 h-5',
    fill: 'none',
    stroke: 'currentColor',
    viewBox: '0 0 24 24'
  }, [
    h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'stroke-width': '2',
      d: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4'
    })
  ])
})

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value
}

function closeDropdown() {
  isDropdownOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
