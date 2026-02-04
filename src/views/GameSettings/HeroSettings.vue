<template>
  <div class="min-h-screen">
    <Navigation />
    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 返回按钮 -->
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

      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ t('settings.heroPageTitle') }}</h1>
        <p class="text-gray-600">{{ t('settings.heroPageDesc') }}</p>
      </div>

      <!-- 游戏参数配置 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">{{ t('settings.gameParams') }}</h2>
        <GameConfigPanel
          :config="config"
          @update:config="handleConfigUpdate"
        />
      </div>

      <!-- 数据管理 -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">数据管理</h2>
        <DataManager
          :schema="heroSchema"
          :default-data="defaultHeroes"
          :custom-data="customHeroes"
          v-model="useCustom"
          @update:custom-data="handleCustomDataChange"
          @reset="handleReset"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Navigation from '../../components/Navigation.vue'

const { t } = useI18n()
import GameConfigPanel from '../../components/GameConfigPanel.vue'
import DataManager from '../../components/DataManager.vue'
import { heroSchema } from '../../schemas/heroSchema'
import heroesData from '../../data/heroes.json'
import { getGameConfig, saveGameSettings, getGameSettings } from '../../utils/storageUtils'
import {
  getCustomGameData,
  saveCustomGameData,
  resetToDefaultData,
  switchToCustomData
} from '../../utils/storageUtils'
import type { GameConfig } from '../../utils/storageUtils'
import type { HeroData } from '../../schemas/heroSchema'

const config = ref<GameConfig>({
  enableTimer: false,
  timerDuration: 5,
  limitAttempts: false,
  maxAttempts: 5,
  showInitialHint: true
})

const defaultHeroes = ref<HeroData[]>(heroesData as HeroData[])
const customHeroes = ref<HeroData[]>([])
const useCustom = ref(false)

function loadData() {
  const customData = getCustomGameData<HeroData>('hero')
  if (customData && customData.useCustom) {
    useCustom.value = true
    customHeroes.value = customData.items
  } else {
    useCustom.value = false
    customHeroes.value = []
  }
}

watch(() => useCustom.value, (value) => {
  if (value) {
    if (customHeroes.value.length === 0) {
      const copied = switchToCustomData<HeroData>('hero', defaultHeroes.value)
      customHeroes.value = copied.items
    } else {
      saveCustomGameData('hero', {
        useCustom: true,
        items: customHeroes.value,
        lastModified: Date.now(),
        expiresAt: 0
      })
    }
  } else {
    saveCustomGameData('hero', {
      useCustom: false,
      items: [],
      lastModified: Date.now(),
      expiresAt: 0
    })
  }
})

function handleCustomDataChange(data: Record<string, any>[]) {
  customHeroes.value = data as HeroData[]
  saveCustomGameData('hero', {
    useCustom: true,
    items: data,
    lastModified: Date.now(),
    expiresAt: 0
  })
}

function handleReset() {
  resetToDefaultData('hero')
  customHeroes.value = []
  useCustom.value = false
}

function handleConfigUpdate(newConfig: GameConfig) {
  config.value = newConfig
  const settings = getGameSettings()
  if (!settings.overrides.hero) {
    settings.overrides.hero = {}
  }
  settings.overrides.hero = {
    enableTimer: config.value.enableTimer,
    timerDuration: config.value.timerDuration,
    limitAttempts: config.value.limitAttempts,
    maxAttempts: Number.isFinite(config.value.maxAttempts) ? config.value.maxAttempts : 5,
    showInitialHint: config.value.showInitialHint
  }
  saveGameSettings(settings)
}

onMounted(() => {
  const currentConfig = getGameConfig('hero')
  config.value = { ...currentConfig }
  loadData()
  
  const settings = getGameSettings()
  if (!settings.overrides.hero) {
    settings.overrides.hero = {}
  }
  settings.overrides.hero = {
    enableTimer: config.value.enableTimer,
    timerDuration: config.value.timerDuration,
    limitAttempts: config.value.limitAttempts,
    maxAttempts: Number.isFinite(config.value.maxAttempts) ? config.value.maxAttempts : 5,
    showInitialHint: config.value.showInitialHint
  }
  saveGameSettings(settings)
})
</script>
