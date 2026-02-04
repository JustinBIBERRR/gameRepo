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
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ t('settings.cityPageTitle') }}</h1>
        <p class="text-gray-600">{{ t('settings.cityPageDesc') }}</p>
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
        <h2 class="text-xl font-semibold text-gray-900 mb-6">{{ t('settings.dataManage') }}</h2>
        <DataManager
          :schema="citySchema"
          :default-data="defaultCities"
          :custom-data="customCities"
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
import { citySchema } from '../../schemas/citySchema'
import citiesData from '../../data/cities.json'
import { getGameConfig, saveGameSettings, getGameSettings } from '../../utils/storageUtils'
import {
  getCustomGameData,
  saveCustomGameData,
  switchToCustomData,
  resetToDefaultData
} from '../../utils/storageUtils'
import type { GameConfig } from '../../utils/storageUtils'
import type { CityData } from '../../schemas/citySchema'

const config = ref<GameConfig>({
  enableTimer: true,
  timerDuration: 5,
  maxAttempts: 5,
  showInitialHint: true
})

const defaultCities = ref<CityData[]>(Array.isArray(citiesData) ? (citiesData as CityData[]) : [])
const customCities = ref<CityData[]>([])
const useCustom = ref(false)

function loadData() {
  try {
    const customData = getCustomGameData<CityData>('city')
    if (customData && customData.useCustom && Array.isArray(customData.items)) {
      useCustom.value = true
      customCities.value = customData.items
    } else {
      useCustom.value = false
      customCities.value = []
    }
  } catch (error) {
    console.error('加载城市数据失败:', error)
    useCustom.value = false
    customCities.value = []
  }
}

watch(() => useCustom.value, (value) => {
  try {
    if (value) {
      // 切换到自定义数据，复制默认数据
      if (customCities.value.length === 0 && defaultCities.value.length > 0) {
        const copied = switchToCustomData<CityData>('city', defaultCities.value)
        customCities.value = copied.items || []
      } else if (customCities.value.length > 0) {
        saveCustomGameData('city', {
          useCustom: true,
          items: customCities.value,
          lastModified: Date.now(),
          expiresAt: 0
        })
      }
    } else {
      // 切换到默认数据
      saveCustomGameData('city', {
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

function handleCustomDataChange(data: Record<string, any>[]) {
  customCities.value = data as CityData[]
  saveCustomGameData('city', {
    useCustom: true,
    items: data,
    lastModified: Date.now(),
    expiresAt: 0
  })
}

function handleReset() {
  resetToDefaultData('city')
  customCities.value = []
  useCustom.value = false
}

function handleConfigUpdate(newConfig: GameConfig) {
  config.value = newConfig
  const settings = getGameSettings()
  if (!settings.overrides.city) {
    settings.overrides.city = {}
  }
  settings.overrides.city = {
    enableTimer: config.value.enableTimer,
    timerDuration: config.value.timerDuration,
    maxAttempts: config.value.maxAttempts,
    showInitialHint: config.value.showInitialHint
  }
  saveGameSettings(settings)
}

onMounted(() => {
  // 加载当前配置
  const currentConfig = getGameConfig('city')
  config.value = { ...currentConfig }
  
  // 加载数据
  loadData()
  
  // 保存配置
  const settings = getGameSettings()
  if (!settings.overrides.city) {
    settings.overrides.city = {}
  }
  settings.overrides.city = {
    enableTimer: config.value.enableTimer,
    timerDuration: config.value.timerDuration,
    maxAttempts: config.value.maxAttempts,
    showInitialHint: config.value.showInitialHint
  }
  saveGameSettings(settings)
})
</script>
