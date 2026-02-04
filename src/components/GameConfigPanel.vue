<template>
  <div class="space-y-4">
    <!-- 倒计时配置卡片 -->
    <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ t('config.timerTitle') }}</h3>
          <p class="text-sm text-gray-500">{{ t('config.timerDesc') }}</p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input
            v-model="localConfig.enableTimer"
            type="checkbox"
            class="sr-only peer"
            @change="handleChange"
          />
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
      
      <!-- 倒计时时长配置 -->
      <div v-if="localConfig.enableTimer" class="mt-4 pt-4 border-t border-gray-100">
        <label class="block text-sm font-medium text-gray-700 mb-3">
          {{ t('config.timerDurationLabel') }}
        </label>
        <div class="flex items-center gap-2">
          <button
            @click="decreaseTimer"
            :disabled="localConfig.timerDuration <= 1"
            class="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
            </svg>
          </button>
          <input
            v-model.number="localConfig.timerDuration"
            type="number"
            min="1"
            max="60"
            class="flex-1 px-4 py-2 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            @input="handleChange"
          />
          <button
            @click="increaseTimer"
            :disabled="localConfig.timerDuration >= 60"
            class="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        <p class="mt-2 text-xs text-gray-500">{{ t('config.timerRange') }}</p>
      </div>
    </div>

    <!-- 尝试次数配置卡片 -->
    <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ t('config.attemptsTitle') }}</h3>
        <p class="text-sm text-gray-500">{{ t('config.attemptsDesc') }}</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="decreaseAttempts"
          :disabled="localConfig.maxAttempts <= 3"
          class="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
          </svg>
        </button>
        <input
          v-model.number="localConfig.maxAttempts"
          type="number"
          min="3"
          max="10"
          class="flex-1 px-4 py-2 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          @input="handleChange"
        />
        <button
          @click="increaseAttempts"
          :disabled="localConfig.maxAttempts >= 10"
          class="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      <p class="mt-2 text-xs text-gray-500">{{ t('config.attemptsRange') }}</p>
    </div>

    <!-- 初始提示配置卡片 -->
    <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ t('config.initialHintTitle') }}</h3>
          <p class="text-sm text-gray-500">{{ t('config.initialHintDesc') }}</p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input
            v-model="localConfig.showInitialHint"
            type="checkbox"
            class="sr-only peer"
            @change="handleChange"
          />
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>

    <!-- 电影游戏特有的配置 -->
    <div v-if="showMovieConfig" class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ t('config.playbackTitle') }}</h3>
        <p class="text-sm text-gray-500">{{ t('config.playbackDesc') }}</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="decreasePlayback"
          :disabled="(localConfig.maxPlaybackPerSegment || 1) <= 1"
          class="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
          </svg>
        </button>
        <input
          v-model.number="localConfig.maxPlaybackPerSegment"
          type="number"
          min="1"
          max="10"
          class="flex-1 px-4 py-2 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          @input="handleChange"
        />
        <button
          @click="increasePlayback"
          :disabled="(localConfig.maxPlaybackPerSegment || 1) >= 10"
          class="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      <p class="mt-2 text-xs text-gray-500">{{ t('config.playbackRange') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { GameConfig } from '../utils/storageUtils'

const { t } = useI18n()

const props = defineProps<{
  config: GameConfig
  showMovieConfig?: boolean
}>()

const emit = defineEmits<{
  'update:config': [config: GameConfig]
}>()

const localConfig = ref<GameConfig>({ ...props.config })

watch(() => props.config, (newConfig) => {
  localConfig.value = { ...newConfig }
}, { deep: true })

function handleChange() {
  emit('update:config', { ...localConfig.value })
}

function decreaseTimer() {
  if (localConfig.value.timerDuration > 1) {
    localConfig.value.timerDuration--
    handleChange()
  }
}

function increaseTimer() {
  if (localConfig.value.timerDuration < 60) {
    localConfig.value.timerDuration++
    handleChange()
  }
}

function decreaseAttempts() {
  if (localConfig.value.maxAttempts > 3) {
    localConfig.value.maxAttempts--
    handleChange()
  }
}

function increaseAttempts() {
  if (localConfig.value.maxAttempts < 10) {
    localConfig.value.maxAttempts++
    handleChange()
  }
}

function decreasePlayback() {
  const current = localConfig.value.maxPlaybackPerSegment || 1
  if (current > 1) {
    localConfig.value.maxPlaybackPerSegment = current - 1
    handleChange()
  }
}

function increasePlayback() {
  const current = localConfig.value.maxPlaybackPerSegment || 1
  if (current < 10) {
    localConfig.value.maxPlaybackPerSegment = current + 1
    handleChange()
  }
}
</script>
