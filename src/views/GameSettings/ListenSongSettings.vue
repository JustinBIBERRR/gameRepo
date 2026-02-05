<template>
  <div class="min-h-screen">
    <Navigation />
    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-6">
        <router-link
          to="/settings"
          class="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          {{ t('settings.backToSettings') }}
        </router-link>
      </div>

      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ t('settings.listenSongPageTitle') }}</h1>
        <p class="text-gray-600">{{ t('settings.listenSongPageDesc') }}</p>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">{{ t('settings.gameParams') }}</h2>
        <GameConfigPanel
          :config="config"
          @update:config="handleConfigUpdate"
        />
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">{{ t('settings.dataManage') }}</h2>
        <ListenSongDataManager />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Navigation from '../../components/Navigation.vue'
import GameConfigPanel from '../../components/GameConfigPanel.vue'
import ListenSongDataManager from '../../components/ListenSongDataManager.vue'
import { getGameConfig, saveGameSettings, getGameSettings } from '../../utils/storageUtils'
import type { GameConfig } from '../../utils/storageUtils'

const { t } = useI18n()

const config = ref<GameConfig>({
  enableTimer: false,
  timerDuration: 5,
  limitAttempts: false,
  maxAttempts: 5,
  showInitialHint: true
})

function handleConfigUpdate(newConfig: GameConfig) {
  config.value = newConfig
  const settings = getGameSettings()
  if (!settings.overrides.listenSong) settings.overrides.listenSong = {}
  settings.overrides.listenSong = {
    enableTimer: newConfig.enableTimer,
    timerDuration: newConfig.timerDuration,
    limitAttempts: newConfig.limitAttempts,
    maxAttempts: Number.isFinite(newConfig.maxAttempts) ? newConfig.maxAttempts : 5,
    showInitialHint: newConfig.showInitialHint
  }
  saveGameSettings(settings)
}

onMounted(() => {
  config.value = { ...getGameConfig('listenSong') }
  const s = getGameSettings()
  if (!s.overrides.listenSong) s.overrides.listenSong = {}
  s.overrides.listenSong = {
    enableTimer: config.value.enableTimer,
    timerDuration: config.value.timerDuration,
    limitAttempts: config.value.limitAttempts,
    maxAttempts: Number.isFinite(config.value.maxAttempts) ? config.value.maxAttempts : 5,
    showInitialHint: config.value.showInitialHint
  }
  saveGameSettings(s)
})
</script>
