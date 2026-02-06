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
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ t('settings.imageMemePageTitle') }}</h1>
        <p class="text-gray-600">{{ t('settings.imageMemePageDesc') }}</p>
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
        <DataManager
          :schema="imageMemeSchema"
          :default-data="defaultItemsForTable"
          :custom-data="customItemsForTable"
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
import GameConfigPanel from '../../components/GameConfigPanel.vue'
import DataManager from '../../components/DataManager.vue'
import { imageMemeSchema } from '../../schemas/imageMemeSchema'
import { defaultImageMemeItems } from '../../data/imageMemeDefaults'
import {
  getGameConfig,
  saveGameSettings,
  getGameSettings,
  getCustomGameData,
  saveCustomGameData,
  switchToCustomData,
  resetToDefaultData
} from '../../utils/storageUtils'
import type { GameConfig } from '../../utils/storageUtils'
import type { ImageMemeItem } from '../../schemas/imageMemeSchema'

const { t } = useI18n()

const config = ref<GameConfig>({
  enableTimer: false,
  timerDuration: 5,
  limitAttempts: false,
  maxAttempts: 5,
  showInitialHint: false
})

const defaultItemsForTable = computed<ImageMemeItem[]>(() => [...defaultImageMemeItems])
const customItemsForTable = ref<ImageMemeItem[]>([])
const useCustom = ref(false)

function loadData() {
  try {
    const customData = getCustomGameData<ImageMemeItem>('imageMeme')
    if (customData?.useCustom && Array.isArray(customData.items) && customData.items.length > 0) {
      useCustom.value = true
      customItemsForTable.value = customData.items
    } else {
      useCustom.value = false
      customItemsForTable.value = []
    }
  } catch (error) {
    console.error('加载看图猜梗数据失败:', error)
    useCustom.value = false
    customItemsForTable.value = []
  }
}

watch(() => useCustom.value, (value) => {
  try {
    if (value) {
      if (customItemsForTable.value.length === 0 && defaultItemsForTable.value.length > 0) {
        const copied = switchToCustomData<ImageMemeItem>('imageMeme', defaultItemsForTable.value)
        customItemsForTable.value = copied.items ?? []
      } else if (customItemsForTable.value.length > 0) {
        saveCustomGameData('imageMeme', {
          useCustom: true,
          items: customItemsForTable.value,
          lastModified: Date.now(),
          expiresAt: 0
        })
      }
    } else {
      saveCustomGameData('imageMeme', {
        useCustom: false,
        items: [],
        lastModified: Date.now(),
        expiresAt: 0
      })
    }
  } catch (error) {
    console.error('切换数据模式失败:', error)
  }
})

function handleCustomDataChange(data: Record<string, unknown>[]) {
  const items = data as unknown as ImageMemeItem[]
  customItemsForTable.value = items
  saveCustomGameData('imageMeme', {
    useCustom: true,
    items,
    lastModified: Date.now(),
    expiresAt: 0
  })
}

function handleReset() {
  resetToDefaultData('imageMeme')
  customItemsForTable.value = []
  useCustom.value = false
}

function handleConfigUpdate(newConfig: GameConfig) {
  config.value = newConfig
  const settings = getGameSettings()
  if (!settings.overrides.imageMeme) settings.overrides.imageMeme = {}
  settings.overrides.imageMeme = {
    enableTimer: newConfig.enableTimer,
    timerDuration: newConfig.timerDuration,
    limitAttempts: newConfig.limitAttempts,
    maxAttempts: Number.isFinite(newConfig.maxAttempts) ? newConfig.maxAttempts : 5
  }
  saveGameSettings(settings)
}

onMounted(() => {
  const currentConfig = getGameConfig('imageMeme')
  config.value = {
    ...currentConfig,
    showInitialHint: false
  }
  const settings = getGameSettings()
  if (!settings.overrides.imageMeme) settings.overrides.imageMeme = {}
  settings.overrides.imageMeme = {
    enableTimer: config.value.enableTimer,
    timerDuration: config.value.timerDuration,
    limitAttempts: config.value.limitAttempts,
    maxAttempts: Number.isFinite(config.value.maxAttempts) ? config.value.maxAttempts : 5
  }
  saveGameSettings(settings)
  loadData()
})
</script>
