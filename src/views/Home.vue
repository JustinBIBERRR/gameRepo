<template>
  <div class="min-h-screen">
    <Navigation />
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Hero Section -->
      <div class="text-center mb-16">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          欢迎来到游戏平台
        </h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          一个集合了多种有趣小游戏的在线平台，挑战你的知识和推理能力！
        </p>
      </div>

      <!-- Games Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <GameCard
          v-for="game in games"
          :key="game.path"
          :game="game"
        />
      </div>

      <!-- Stats Section -->
      <div v-if="hasAnyStats || hasGameData" class="mt-16 space-y-8">
        <!-- 总体统计 -->
        <div class="max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900">游戏统计</h2>
            <button
              @click="clearSessionData"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 min-h-[44px]"
              aria-label="清除会话数据"
            >
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                清除数据
              </span>
            </button>
          </div>
          
          <!-- 总体数据 -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="text-center p-4 bg-green-50 rounded-lg border border-green-100">
              <div class="text-2xl md:text-3xl font-bold text-green-600 mb-1">{{ totalStats.wins }}</div>
              <div class="text-xs font-medium text-green-700">总胜利</div>
            </div>
            <div class="text-center p-4 bg-red-50 rounded-lg border border-red-100">
              <div class="text-2xl md:text-3xl font-bold text-red-600 mb-1">{{ totalStats.losses }}</div>
              <div class="text-xs font-medium text-red-700">总失败</div>
            </div>
            <div class="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div class="text-2xl md:text-3xl font-bold text-blue-600 mb-1">{{ totalStats.total }}</div>
              <div class="text-xs font-medium text-blue-700">总游戏</div>
            </div>
            <div class="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
              <div class="text-2xl md:text-3xl font-bold text-purple-600 mb-1">{{ totalStats.bestStreak }}</div>
              <div class="text-xs font-medium text-purple-700">最佳连胜</div>
            </div>
          </div>
          
          <!-- 今日统计 -->
          <div v-if="todayStats.games > 0" class="mt-6 pt-6 border-t border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">今日统计</h3>
            <div class="grid grid-cols-3 gap-4">
              <div class="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                <div class="text-xl font-bold text-yellow-600 mb-1">{{ todayStats.games }}</div>
                <div class="text-xs font-medium text-yellow-700">今日游戏</div>
              </div>
              <div class="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                <div class="text-xl font-bold text-green-600 mb-1">{{ todayStats.wins }}</div>
                <div class="text-xs font-medium text-green-700">今日胜利</div>
              </div>
              <div class="text-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                <div class="text-xl font-bold text-orange-600 mb-1">{{ todayStats.winRate }}%</div>
                <div class="text-xs font-medium text-orange-700">胜率</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 成就展示 -->
        <div v-if="unlockedAchievements.length > 0" class="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">已解锁成就</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AchievementBadge
              v-for="achievement in unlockedAchievements"
              :key="achievement.id"
              :achievement="achievement"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import Navigation from '../components/Navigation.vue'
import GameCard from '../components/GameCard.vue'
import AchievementBadge from '../components/AchievementBadge.vue'
import { useModal } from '../composables/useModal'
import { getGameStats, clearAllData, getGameVisibility } from '../utils/storageUtils'
import { getAchievements } from '../utils/storageUtils'

const { confirm: showConfirm, success: showSuccess } = useModal()

const allGames = [
  {
    gameType: 'city' as const,
    title: '城市猜测',
    description: '系统随机选择一个国内城市，你有5次机会猜测。每次猜测后会显示距离、方位和城市特点。',
    path: '/city-guess',
    iconColor: 'blue' as const,
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
    ])
  },
  {
    gameType: 'hero' as const,
    title: '王者荣耀人物猜测',
    description: '系统随机选择一个王者荣耀英雄，你有5次机会猜测。通过职业、年代、国籍、人类、性别等属性提示来找到答案。',
    path: '/hero-guess',
    iconColor: 'purple' as const,
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
    ])
  },
  {
    gameType: 'movie' as const,
    title: '听片段猜电影',
    description: '系统随机选择一部电影，你有8次机会猜测。通过听15秒音频片段来找到答案。',
    path: '/movie-guess',
    iconColor: 'red' as const,
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
    ])
  }
]

// 根据可见性配置过滤游戏
const games = computed(() => {
  const visibility = getGameVisibility()
  return allGames.filter(game => visibility[game.gameType])
})

const stats = ref({
  wins: 0,
  losses: 0,
  total: 0
})

const hasGameData = ref(false)

// 使用 ref 存储统计数据，以便清除后能实时更新
const cityStats = ref(getGameStats('city'))
const heroStats = ref(getGameStats('hero'))
const movieStats = ref(getGameStats('movie'))
const allAchievements = ref(getAchievements())

// 刷新统计数据
function refreshStats() {
  cityStats.value = getGameStats('city')
  heroStats.value = getGameStats('hero')
  movieStats.value = getGameStats('movie')
  allAchievements.value = getAchievements()
}

const totalStats = computed(() => {
  return {
    wins: cityStats.value.wins + heroStats.value.wins + movieStats.value.wins,
    losses: cityStats.value.losses + heroStats.value.losses + movieStats.value.losses,
    total: cityStats.value.totalGames + heroStats.value.totalGames + movieStats.value.totalGames,
    bestStreak: Math.max(cityStats.value.bestStreak, heroStats.value.bestStreak, movieStats.value.bestStreak)
  }
})

const todayStats = computed(() => {
  const cityToday = cityStats.value.todayStats.date === new Date().toDateString() 
    ? cityStats.value.todayStats 
    : { games: 0, wins: 0 }
  const heroToday = heroStats.value.todayStats.date === new Date().toDateString()
    ? heroStats.value.todayStats
    : { games: 0, wins: 0 }
  const movieToday = movieStats.value.todayStats.date === new Date().toDateString()
    ? movieStats.value.todayStats
    : { games: 0, wins: 0 }
  
  const games = cityToday.games + heroToday.games + movieToday.games
  const wins = cityToday.wins + heroToday.wins + movieToday.wins
  
  return {
    games,
    wins,
    winRate: games > 0 ? Math.round((wins / games) * 100) : 0
  }
})

const hasAnyStats = computed(() => {
  return totalStats.value.total > 0 || todayStats.value.games > 0
})

// 获取已解锁的成就
const unlockedAchievements = computed(() => {
  return allAchievements.value
    .filter(a => a.unlockedAt !== null)
    .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
    .slice(0, 8) // 只显示最近8个
})

function checkGameData() {
  hasGameData.value = !!(
    sessionStorage.getItem('gameStats') ||
    sessionStorage.getItem('cityGuessGame') ||
    sessionStorage.getItem('heroGuessGame') ||
    sessionStorage.getItem('movieGuessGame')
  )
}

function clearSessionData() {
  showConfirm({
    title: '清除所有数据',
    message: '确定要清除所有数据吗？这将清除游戏统计、成就和所有游戏进度。此操作不可恢复！',
    confirmText: '确定清除',
    cancelText: '取消'
  }).then((result) => {
    if (result) {
      // 清除所有数据
      clearAllData()
      sessionStorage.removeItem('cityGuessGame')
      sessionStorage.removeItem('heroGuessGame')
      sessionStorage.removeItem('movieGuessGame')
      
      // 重置统计数据
      stats.value = {
        wins: 0,
        losses: 0,
        total: 0
      }
      
      hasGameData.value = false
      
      // 刷新统计数据（重新从 localStorage 读取，此时应该是空数据）
      refreshStats()
      
      showSuccess({
        title: '清除成功',
        message: '所有数据已清除！'
      })
    }
  })
}

onMounted(() => {
  // 从 sessionStorage 读取统计信息
  const savedStats = sessionStorage.getItem('gameStats')
  if (savedStats) {
    try {
      stats.value = JSON.parse(savedStats)
    } catch (e) {
      console.error('Failed to parse stats:', e)
    }
  }
  
  // 初始化统计数据
  refreshStats()
  
  // 检查是否有游戏数据
  checkGameData()
})
</script>
