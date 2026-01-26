<template>
  <div>
    <!-- 游戏名称、描述和清除按钮 -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ title }}</h1>
        <p class="text-gray-600">
          {{ description }}
          <span v-if="showRemainingAttempts" class="font-bold text-blue-600">{{ remainingAttempts }}</span>
          {{ descriptionSuffix }}
        </p>
      </div>
      <button
        @click="$emit('clear')"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 min-h-[44px] self-start sm:self-auto"
        aria-label="清除数据并重新开始"
      >
        <span class="flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          清除数据
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
          <div class="font-semibold text-blue-900 mb-1">初始提示</div>
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
import GameTimer from './GameTimer.vue'
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
  description: '系统随机选择了一个目标，你有',
  descriptionSuffix: '次猜测机会！',
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

const remainingAttempts = computed(() => props.maxAttempts - props.attempts)
</script>
