<template>
  <div>
    <!-- 游戏名称、描述和再来一局按钮 -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ title }}</h1>
        <p class="text-gray-600">
          {{ description }}
          <span v-if="showRemainingAttempts" class="font-bold text-blue-600">{{ attemptsDisplay }}</span>
          {{ descriptionSuffix }}
        </p>
      </div>
      <button
        @click="$emit('clear')"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 min-h-[44px] self-start sm:self-auto"
        :aria-label="t('game.playAgainAria')"
      >
        <span class="flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ t('game.playAgain') }}
        </span>
      </button>
    </div>

    <!-- 倒计时显示 -->
    <div v-if="enableTimer && !gameOver && !gameWon" class="mb-4">
      <GameTimer
        :formatted-time="formattedTime"
        :is-warning="isWarning"
      />
    </div>

    <!-- 倒计时恢复提示 -->
    <TimerRestoreTip
      v-if="enableTimer && showRestoreTip"
      :message="restoreTipMessage"
    />

    <!-- 初始提示 -->
    <div v-if="initialHint && showInitialHint && !gameOver && !gameWon" class="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex items-start">
        <span class="text-2xl mr-2">💡</span>
        <div>
          <div class="font-semibold text-blue-900 mb-1">{{ t('game.initialHintLabel') }}</div>
          <div class="text-blue-800">
            <slot name="hint-content">
              {{ hintPrefix }}<span class="font-bold">{{ initialHint }}</span>{{ hintSuffix }}
            </slot>
          </div>
        </div>
      </div>
    </div>

    <!-- 进度条 -->
    <div v-if="!gameOver && !gameWon" class="mb-6">
      <ProgressBar
        :current="attempts"
        :max="maxAttempts"
        :closeness="closeness"
        :closeness-text="closenessText"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import GameTimer from './GameTimer.vue'

const { t } = useI18n()
import TimerRestoreTip from './TimerRestoreTip.vue'
import ProgressBar from './ProgressBar.vue'

interface Props {
  // 游戏标题和描述
  title: string
  description?: string
  descriptionSuffix?: string
  showRemainingAttempts?: boolean
  
  // 游戏状态
  attempts: number
  maxAttempts: number
  gameOver: boolean
  gameWon: boolean
  
  // 倒计时相关
  enableTimer: boolean
  formattedTime?: string
  isWarning?: boolean
  showRestoreTip?: boolean
  restoreTipMessage?: string
  
  // 初始提示相关
  showInitialHint: boolean
  initialHint?: string | null
  hintPrefix?: string
  hintSuffix?: string
  
  // 进度条相关
  closeness?: number | null
  closenessText?: string
}

const props = withDefaults(defineProps<Props>(), {
  description: undefined,
  descriptionSuffix: undefined,
  showRemainingAttempts: true,
  formattedTime: '00:00',
  isWarning: false,
  showRestoreTip: false,
  restoreTipMessage: '',
  hintPrefix: '',
  hintSuffix: '',
  closeness: null,
  closenessText: ''
})

defineEmits<{
  clear: []
}>()

const isAttemptsUnlimited = computed(() => !Number.isFinite(props.maxAttempts) || props.maxAttempts <= 0)
const attemptsDisplay = computed(() =>
  isAttemptsUnlimited.value ? t('game.attemptsUnlimited') : (props.maxAttempts - props.attempts)
)
</script>
