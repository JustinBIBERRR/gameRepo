<template>
  <div class="min-h-screen">
    <Navigation />
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- 标题 -->
      <div class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {{ t('settings.title') }}
        </h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          {{ t('settings.subtitle') }}
        </p>
      </div>

      <!-- 游戏卡片网格 + 年会活动卡片 -->
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
        <!-- 年会/活动配置卡片 -->
        <router-link
          to="/settings/party"
          class="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col p-6 flex-1 cursor-pointer group relative"
        >
          <span
            class="absolute top-4 right-4 inline-flex px-2.5 py-1 text-xs font-medium rounded-md bg-amber-100 text-amber-800 z-10"
          >
            {{ t('settings.globalConfig') }}
          </span>
          <div class="flex items-start gap-4 mb-4">
            <div class="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center bg-amber-100">
              <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-xl font-bold text-gray-900 mb-2">{{ t('settings.partyTitle') }}</h3>
              <p class="text-gray-600 text-sm leading-relaxed">{{ t('settings.partyDesc') }}</p>
            </div>
          </div>
          <div class="mt-auto pt-4 text-sm text-gray-500 text-center">{{ t('settings.clickToEnter') }}</div>
        </router-link>
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
  listenSong: true
})


// 使用统一配置，但为设置页面定制描述
const games = computed(() => {
  return allGamesConfig.map(game => ({
    ...game,
    description: t('settings.gameCardDesc', { name: t(game.title) }),
    path: game.settingsPath
  }))
})

function handleVisibilityChange(gameType: 'city' | 'hero' | 'movie' | 'visual' | 'listenSong', visible: boolean) {
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
      return t('games.visual.title')
    }).join(t('common.comma'))
    showSuccess({
      title: t('settings.expiredTitle'),
      message: t('settings.expiredMessage', { games: gameNames })
    })
  }
})
</script>

