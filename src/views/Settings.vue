<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white">
    <Navigation />
    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <!-- 返回首页 -->
      <div class="mb-6">
        <router-link
          to="/"
          class="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          {{ t('game.backToHome') }}
        </router-link>
      </div>
      <!-- 标题 -->
      <div class="mb-10">
        <h1 class="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
          {{ t('settings.title') }}
        </h1>
        <p class="text-slate-600">
          {{ t('settings.subtitle') }}
        </p>
      </div>

      <!-- 1. 全局配置：置顶横条卡片 -->
      <router-link
        to="/settings/party"
        class="settings-global-card block mb-8 p-5 md:p-6 rounded-xl border-2 border-amber-200/80 bg-white/90 hover:border-amber-400 hover:bg-amber-50/50 transition-all duration-300 cursor-pointer group"
      >
        <div class="flex items-center gap-4">
          <span
            class="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-amber-500 text-white shrink-0"
          >
            {{ t('settings.globalConfig') }}
          </span>
          <div class="flex-1 min-w-0 flex items-center gap-4">
            <div class="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-amber-100 group-hover:bg-amber-200 transition-colors">
              <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-bold text-slate-800 mb-0.5">{{ t('settings.partyTitle') }}</h3>
              <p class="text-slate-600 text-sm">{{ t('settings.partyDesc') }}</p>
            </div>
            <svg class="w-5 h-5 text-slate-400 group-hover:text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </router-link>

      <!-- 2. 游戏管理：列表式卡片 -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold text-slate-700 px-1">{{ t('settings.gameManage') }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Navigation from '../components/Navigation.vue'
import SettingsCard from '../components/SettingsCard.vue'
import { getGameVisibility, checkAndClearExpiredData, type GameVisibility } from '../utils/storageUtils'
import { useModal } from '../composables/useModal'
import { allGamesConfig } from '../config/games'

const { t } = useI18n()
const { success: showSuccess } = useModal()

const visibility = ref<GameVisibility>({
  city: true,
  hero: true,
  movie: true,
  visual: true,
  listenSong: true,
  imageMeme: true
})


// 使用统一配置，但为设置页面定制描述
const games = computed(() => {
  return allGamesConfig.map(game => ({
    ...game,
    description: t('settings.gameCardDesc', { name: t(game.title) }),
    path: game.settingsPath
  }))
})

function handleVisibilityChange(gameType: 'city' | 'hero' | 'movie' | 'visual' | 'listenSong' | 'imageMeme', visible: boolean) {
  visibility.value[gameType] = visible
}

onMounted(() => {
  const vis = getGameVisibility()
  visibility.value = { ...vis }
  const clearedGames = checkAndClearExpiredData()
  if (clearedGames.length > 0) {
    const gameNames = clearedGames.map(type => {
      if (type === 'city') return t('games.city.title')
      if (type === 'hero') return t('games.hero.title')
      if (type === 'movie') return t('games.movie.title')
      if (type === 'visual') return t('games.visual.title')
      if (type === 'imageMeme') return t('games.imageMeme.title')
      return type
    }).join(t('common.comma'))
    showSuccess({
      title: t('settings.expiredTitle'),
      message: t('settings.expiredMessage', { games: gameNames })
    })
  }
})
</script>

