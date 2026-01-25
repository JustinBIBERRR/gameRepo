<template>
  <div class="space-y-4">
    <!-- 时间轴拖拽 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        选择时间点
      </label>
      <div class="flex items-center gap-4">
        <input
          type="range"
          :min="0"
          :max="maxDuration"
          :value="currentSeconds"
          @input="handleSliderChange"
          class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <span class="text-sm font-medium text-gray-600 min-w-[80px] text-right">
          {{ formattedTime }}
        </span>
      </div>
      <div class="flex justify-between text-xs text-gray-500 mt-1">
        <span>0:00</span>
        <span>{{ formatMaxTime }}</span>
      </div>
    </div>

    <!-- 数字输入 -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          分钟
        </label>
        <input
          v-model.number="localMinutes"
          type="number"
          :min="0"
          :max="maxMinutes"
          @input="handleInputChange"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          秒
        </label>
        <input
          v-model.number="localSeconds"
          type="number"
          :min="0"
          :max="59"
          @input="handleInputChange"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="text-sm text-red-600">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { secondsToMinutesSeconds, minutesSecondsToSeconds } from '../utils/movieUtils'

interface Props {
  maxDuration: number  // 最大时长（秒）
  value: number        // 当前选择的时间点（秒）
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'change', value: number): void
}>()

const maxMinutes = computed(() => Math.floor(props.maxDuration / 60))
const maxSeconds = computed(() => props.maxDuration % 60)

const currentSeconds = ref(props.value)
const localMinutes = ref(Math.floor(props.value / 60))
const localSeconds = ref(props.value % 60)
const errorMessage = ref('')

// 格式化当前时间
const formattedTime = computed(() => {
  const { minutes, seconds } = secondsToMinutesSeconds(currentSeconds.value)
  return `${minutes}:${String(seconds).padStart(2, '0')}`
})

// 格式化最大时间
const formatMaxTime = computed(() => {
  const { minutes, seconds } = secondsToMinutesSeconds(props.maxDuration)
  return `${minutes}:${String(seconds).padStart(2, '0')}`
})

// 验证时间范围
function validateTime(seconds: number): boolean {
  if (seconds < 0) {
    errorMessage.value = '时间点不能小于0'
    return false
  }
  if (seconds > props.maxDuration) {
    errorMessage.value = `时间点不能超过电影总时长（${formatMaxTime.value}）`
    return false
  }
  errorMessage.value = ''
  return true
}

// 更新当前秒数并验证
function updateSeconds(seconds: number) {
  if (validateTime(seconds)) {
    currentSeconds.value = Math.min(seconds, props.maxDuration)
    const { minutes, secs } = secondsToMinutesSeconds(currentSeconds.value)
    localMinutes.value = minutes
    localSeconds.value = secs
    emit('change', currentSeconds.value)
  }
}

// 处理滑块变化
function handleSliderChange(event: Event) {
  const target = event.target as HTMLInputElement
  const seconds = parseInt(target.value, 10)
  updateSeconds(seconds)
}

// 处理输入变化
function handleInputChange() {
  // 验证输入
  if (localMinutes.value < 0) localMinutes.value = 0
  if (localMinutes.value > maxMinutes.value) localMinutes.value = maxMinutes.value
  if (localSeconds.value < 0) localSeconds.value = 0
  if (localSeconds.value > 59) localSeconds.value = 59
  
  // 如果分钟数达到最大值，限制秒数
  if (localMinutes.value === maxMinutes.value && localSeconds.value > maxSeconds.value) {
    localSeconds.value = maxSeconds.value
  }
  
  const totalSeconds = minutesSecondsToSeconds(localMinutes.value, localSeconds.value)
  updateSeconds(totalSeconds)
}

// 监听外部value变化
watch(() => props.value, (newValue) => {
  if (newValue !== currentSeconds.value) {
    currentSeconds.value = newValue
    const { minutes, seconds } = secondsToMinutesSeconds(newValue)
    localMinutes.value = minutes
    localSeconds.value = seconds
  }
})
</script>

<style scoped>
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
}
</style>
