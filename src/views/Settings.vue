<template>
  <div class="min-h-screen">
    <Navigation />
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- 标题 -->
      <div class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          游戏配置管理
        </h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          管理游戏参数和数据配置
        </p>
      </div>

      <!-- 游戏卡片网格 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <SettingsCard
          v-for="game in games"
          :key="game.gameType"
          :game="game"
          :game-type="game.gameType"
          :visible="visibility[game.gameType]"
          @visibility-change="handleVisibilityChange"
          class="group"
        />
      </div>
    </main>

    <!-- 右侧悬浮设置按钮 -->
    <div class="fixed right-6 bottom-6 z-50">
      <div class="relative">
        <!-- 悬浮按钮 -->
        <button
          @mouseenter="handleButtonEnter"
          @mouseleave="handleMouseLeave"
          class="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
          title="数据过期设置"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <!-- 设置面板 -->
        <Transition name="slide-up">
          <div
            v-if="showExpirationPanel"
            @mouseenter="handlePanelEnter"
            @mouseleave="handleMouseLeave"
            class="absolute right-0 bottom-16 mb-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4"
          >
            <h3 class="text-lg font-semibold text-gray-900 mb-3">数据过期设置</h3>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  数据过期天数
                </label>
                <div class="flex items-center gap-2">
                  <input
                    v-model.number="expirationDays"
                    type="number"
                    min="1"
                    max="365"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    @change="handleExpirationChange"
                  />
                  <span class="text-sm text-gray-600 whitespace-nowrap">天</span>
                </div>
                <p class="mt-1 text-xs text-gray-500">
                  范围：1-365 天，超过此天数未修改的自定义数据将自动清除
                </p>
              </div>
              <div class="pt-2 border-t border-gray-200">
                <p class="text-xs text-gray-600">
                  当前设置：{{ expirationDays }} 天后自动清除未修改的自定义数据
                </p>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Navigation from '../components/Navigation.vue'
import SettingsCard from '../components/SettingsCard.vue'
import { getGameVisibility, checkAndClearExpiredData, getSettingsMeta, updateDataExpirationDays } from '../utils/storageUtils'
import { useModal } from '../composables/useModal'

const { success: showSuccess } = useModal()

const visibility = ref({
  city: true,
  hero: true,
  movie: true
})

const showExpirationPanel = ref(false)
const expirationDays = ref(30)
let mouseLeaveTimer: number | null = null

const games = [
  {
    gameType: 'city' as const,
    title: '城市猜测',
    description: '配置城市数据、游戏参数和倒计时设置',
    path: '/settings/city',
    icon: () => h('svg', {
      class: 'w-6 h-6',
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
      }),
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M15 11a3 3 0 11-6 0 3 3 0 016 0z'
      })
    ]),
    iconColor: 'blue' as const
  },
  {
    gameType: 'hero' as const,
    title: '英雄猜测',
    description: '配置英雄数据、游戏参数和倒计时设置',
    path: '/settings/hero',
    icon: () => h('svg', {
      class: 'w-6 h-6',
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
      })
    ]),
    iconColor: 'purple' as const
  },
  {
    gameType: 'movie' as const,
    title: '电影猜测',
    description: '配置电影数据、游戏参数和倒计时设置',
    path: '/settings/movie',
    icon: () => h('svg', {
      class: 'w-6 h-6',
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
      })
    ]),
    iconColor: 'green' as const
  }
]

function handleVisibilityChange(gameType: 'city' | 'hero' | 'movie', visible: boolean) {
  visibility.value[gameType] = visible
}

function handleButtonEnter() {
  // 鼠标进入按钮时，清除隐藏定时器并显示面板
  if (mouseLeaveTimer) {
    clearTimeout(mouseLeaveTimer)
    mouseLeaveTimer = null
  }
  showExpirationPanel.value = true
}

function handlePanelEnter() {
  // 鼠标进入面板时，清除隐藏定时器
  if (mouseLeaveTimer) {
    clearTimeout(mouseLeaveTimer)
    mouseLeaveTimer = null
  }
  showExpirationPanel.value = true
}

function handleMouseLeave() {
  // 延迟隐藏，避免鼠标移动到面板时立即隐藏
  mouseLeaveTimer = window.setTimeout(() => {
    showExpirationPanel.value = false
  }, 200)
}

function handleExpirationChange() {
  const days = Math.max(1, Math.min(365, expirationDays.value))
  expirationDays.value = days
  updateDataExpirationDays(days)
  showSuccess({
    title: '设置已保存',
    message: `数据过期天数已设置为 ${days} 天`
  })
}

onMounted(() => {
  // 加载可见性配置
  const vis = getGameVisibility()
  visibility.value = { ...vis }
  
  // 加载过期天数配置
  const meta = getSettingsMeta()
  expirationDays.value = meta.dataExpirationDays
  
  // 检查并清除过期数据
  const clearedGames = checkAndClearExpiredData()
  if (clearedGames.length > 0) {
    const gameNames = clearedGames.map(type => {
      if (type === 'city') return '城市猜测'
      if (type === 'hero') return '英雄猜测'
      return '电影猜测'
    }).join('、')
    
    showSuccess({
      title: '数据已过期清除',
      message: `${gameNames}的自定义数据已过期，已恢复为默认数据`
    })
  }
})

onUnmounted(() => {
  if (mouseLeaveTimer) {
    clearTimeout(mouseLeaveTimer)
  }
})
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
