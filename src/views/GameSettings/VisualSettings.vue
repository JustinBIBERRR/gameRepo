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
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ t('settings.visualPageTitle') }}</h1>
        <p class="text-gray-600">{{ t('settings.visualPageDesc') }}</p>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">{{ t('settings.gameParams') }}</h2>
        <GameConfigPanel
          :config="config"
          @update:config="handleConfigUpdate"
        />
        <!-- 初始提示（仅看图猜测） -->
        <div class="mt-6 pt-6 border-t border-gray-200 space-y-4">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 mb-1">初始提示</h3>
              <p class="text-sm text-gray-500">游戏开始时是否显示一条分类/范围提示（由下方文案决定）</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                v-model="showCategoryHint"
                type="checkbox"
                class="sr-only peer"
                @change="saveHintSettings"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('settings.initialHintLabel') }}</label>
            <input
              v-model="initialHintText"
              type="text"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              placeholder="例如：生活用品、品牌logo、国旗、专辑封面等"
              @change="saveHintSettings"
            />
            <p class="mt-1 text-xs text-gray-500">留空则不显示具体文案；开启「初始提示」时显示为：这是一个【文案】</p>
          </div>
        </div>
        <!-- 图片壳等分（区域选择） -->
        <div class="mt-6 pt-6 border-t border-gray-200 space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">区域划分</h3>
          <p class="text-sm text-gray-500">将图片壳按行列等分，玩家每次提示可自选一个区域查看。例如 2×2 为 4 格。</p>
          <div class="flex flex-wrap items-center gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">行数</label>
              <input
                v-model.number="gridRows"
                type="number"
                min="1"
                max="6"
                class="w-20 rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                @change="saveGridSettings"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">列数</label>
              <input
                v-model.number="gridCols"
                type="number"
                min="1"
                max="6"
                class="w-20 rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                @change="saveGridSettings"
              />
            </div>
            <p class="text-sm text-gray-500 self-end">共 {{ gridRows * gridCols }} 格</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">{{ t('settings.dataManage') }}</h2>
        <DataManager
          :schema="itemSchema"
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

const { t } = useI18n()
import GameConfigPanel from '../../components/GameConfigPanel.vue'
import DataManager from '../../components/DataManager.vue'
import { itemSchema } from '../../schemas/itemSchema'
import itemsData from '../../data/json/items.json'
import { getGameConfig, saveGameSettings, getGameSettings } from '../../utils/storageUtils'
import {
  getCustomGameData,
  saveCustomGameData,
  switchToCustomData,
  resetToDefaultData
} from '../../utils/storageUtils'
import type { GameConfig } from '../../utils/storageUtils'
import type { ItemData } from '../../schemas/itemSchema'

type TableRow = ItemData & { imageFullUrl?: string }

function toTableRow(item: ItemData): TableRow {
  return {
    ...item,
    imageFullUrl: item.images?.full ?? ''
  }
}

function fromTableRow(row: TableRow): ItemData {
  const { type: _t, imageFullUrl, ...rest } = row as TableRow & { type?: string }
  return {
    ...rest,
    images: { full: imageFullUrl ?? rest.images?.full ?? '' }
  } as ItemData
}

const config = ref<GameConfig>({
  enableTimer: false,
  timerDuration: 5,
  limitAttempts: false,
  maxAttempts: 3,
  showInitialHint: true
})

const defaultItems = ref<ItemData[]>(Array.isArray(itemsData) ? (itemsData as ItemData[]) : [])
const defaultItemsForTable = computed<TableRow[]>(() => defaultItems.value.map(toTableRow))
const customItemsForTable = ref<TableRow[]>([])
const useCustom = ref(false)
const showCategoryHint = ref(true)
const initialHintText = ref('')
const gridRows = ref(3)
const gridCols = ref(3)

function loadData() {
  try {
    const customData = getCustomGameData<TableRow>('visual')
    if (customData?.useCustom && Array.isArray(customData.items) && customData.items.length > 0) {
      useCustom.value = true
      customItemsForTable.value = customData.items
    } else {
      useCustom.value = false
      customItemsForTable.value = []
    }
  } catch (error) {
    console.error('加载看图猜测数据失败:', error)
    useCustom.value = false
    customItemsForTable.value = []
  }
}

watch(() => useCustom.value, (value) => {
  try {
    if (value) {
      if (customItemsForTable.value.length === 0 && defaultItemsForTable.value.length > 0) {
        const copied = switchToCustomData<TableRow>('visual', defaultItemsForTable.value)
        customItemsForTable.value = copied.items ?? []
      } else if (customItemsForTable.value.length > 0) {
        saveCustomGameData('visual', {
          useCustom: true,
          items: customItemsForTable.value,
          lastModified: Date.now(),
          expiresAt: 0
        })
      }
    } else {
      saveCustomGameData('visual', {
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
  const rows = (data as unknown) as TableRow[]
  customItemsForTable.value = rows
  const items = rows.map(fromTableRow)
  saveCustomGameData('visual', {
    useCustom: true,
    items,
    lastModified: Date.now(),
    expiresAt: 0
  })
}

function handleReset() {
  resetToDefaultData('visual')
  customItemsForTable.value = []
  useCustom.value = false
}

function handleConfigUpdate(newConfig: GameConfig) {
  config.value = newConfig
  const settings = getGameSettings()
  if (!settings.overrides.visual) settings.overrides.visual = {}
  settings.overrides.visual = {
    ...settings.overrides.visual,
    enableTimer: newConfig.enableTimer,
    timerDuration: newConfig.timerDuration,
    limitAttempts: newConfig.limitAttempts,
    maxAttempts: Number.isFinite(newConfig.maxAttempts) ? newConfig.maxAttempts : 5,
    showInitialHint: newConfig.showInitialHint,
    showCategoryHint: showCategoryHint.value,
    initialHint: initialHintText.value.trim() || undefined,
    gridRows: gridRows.value,
    gridCols: gridCols.value
  }
  saveGameSettings(settings)
}

function saveHintSettings() {
  const settings = getGameSettings()
  if (!settings.overrides.visual) settings.overrides.visual = {}
  settings.overrides.visual.showCategoryHint = showCategoryHint.value
  settings.overrides.visual.initialHint = initialHintText.value.trim() || undefined
  saveGameSettings(settings)
}

function saveGridSettings() {
  const settings = getGameSettings()
  if (!settings.overrides.visual) settings.overrides.visual = {}
  settings.overrides.visual.gridRows = Math.min(6, Math.max(1, gridRows.value))
  settings.overrides.visual.gridCols = Math.min(6, Math.max(1, gridCols.value))
  gridRows.value = settings.overrides.visual.gridRows
  gridCols.value = settings.overrides.visual.gridCols
  saveGameSettings(settings)
}

onMounted(() => {
  const currentConfig = getGameConfig('visual')
  config.value = { ...currentConfig }
  const visual = getGameSettings().overrides.visual
  showCategoryHint.value = visual?.showCategoryHint !== false
  initialHintText.value = visual?.initialHint ?? ''
  gridRows.value = Math.min(6, Math.max(1, visual?.gridRows ?? 3))
  gridCols.value = Math.min(6, Math.max(1, visual?.gridCols ?? 3))
  loadData()
  const settings = getGameSettings()
  if (!settings.overrides.visual) settings.overrides.visual = {}
  settings.overrides.visual = {
    ...config.value,
    showCategoryHint: showCategoryHint.value,
    initialHint: initialHintText.value.trim() || undefined,
    gridRows: gridRows.value,
    gridCols: gridCols.value
  }
  saveGameSettings(settings)
})
</script>
