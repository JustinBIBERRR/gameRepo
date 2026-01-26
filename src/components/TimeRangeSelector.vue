<template>
  <div class="space-y-4">
    <!-- 时间轴滑块 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        选择时间段（15秒片段）
      </label>
      
      <!-- 滑块容器 -->
      <div class="relative w-full h-12 bg-gray-100 rounded-lg overflow-hidden">
        <!-- 已播放标记 -->
        <div
          v-for="segment in playedSegments"
          :key="segment"
          class="absolute h-full bg-gray-300 opacity-50"
          :style="{
            left: `${(segment / props.maxDuration) * 100}%`,
            width: `${(props.segmentDuration / props.maxDuration) * 100}%`
          }"
        ></div>
        
        <!-- 当前选中区域 -->
        <div
          class="absolute h-full bg-blue-500 opacity-30 border-2 border-blue-600"
          :style="{
            left: `${(currentSegmentStart / props.maxDuration) * 100}%`,
            width: `${(props.segmentDuration / props.maxDuration) * 100}%`
          }"
        ></div>
        
        <!-- 原生滑块 -->
        <input
          type="range"
          :min="0"
          :max="maxSegments - 1"
          :value="currentSegmentIndex"
          :disabled="props.disabled"
          @input="handleSliderChange"
          class="absolute top-0 left-0 w-full h-full opacity-0 z-10"
          :class="props.disabled ? 'cursor-not-allowed' : 'cursor-pointer'"
        />
        
        <!-- 时间刻度 -->
        <div class="absolute bottom-0 left-0 right-0 flex justify-between px-2 pb-1 text-xs text-gray-500 pointer-events-none">
          <span>0:00</span>
          <span>{{ formatMaxTime }}</span>
        </div>
      </div>
      
      <div class="mt-2 text-center">
        <span class="text-sm font-medium text-gray-700">
          当前选择：{{ formattedTimeRange }}
        </span>
      </div>
      <p class="text-xs mt-2" :class="props.disabled ? 'text-red-500' : 'text-gray-500'">
        {{ props.disabled ? '播放中，请稍候...' : '拖动滑块选择15秒片段 | 蓝色区域=当前选中 | 深灰标记=已播放' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { secondsToMinutesSeconds } from '../utils/movieUtils'

interface Props {
  maxDuration: number  // 最大时长（秒）
  value: number        // 当前选择的时间点（秒）
  playedTimePoints?: number[]  // 已播放的时间点列表
  segmentDuration?: number  // 片段时长（秒），默认15秒
  disabled?: boolean  // 是否禁用滑块
}

const props = withDefaults(defineProps<Props>(), {
  playedTimePoints: () => [],
  segmentDuration: 15,
  disabled: false
})

const emit = defineEmits<{
  (e: 'change', value: number): void
}>()

// 计算总共有多少个片段
const maxSegments = computed(() => {
  return Math.ceil(props.maxDuration / props.segmentDuration)
})

// 当前片段索引
const currentSegmentIndex = computed(() => {
  return Math.floor(props.value / props.segmentDuration)
})

// 当前片段的开始时间
const currentSegmentStart = computed(() => {
  return currentSegmentIndex.value * props.segmentDuration
})

// 当前片段的结束时间
const currentSegmentEnd = computed(() => {
  return Math.min(currentSegmentStart.value + props.segmentDuration, props.maxDuration)
})

// 已播放的片段索引列表
const playedSegments = computed(() => {
  const segments = new Set<number>()
  props.playedTimePoints.forEach(timePoint => {
    const segmentIndex = Math.floor(timePoint / props.segmentDuration)
    segments.add(segmentIndex * props.segmentDuration)
  })
  return Array.from(segments)
})

// 格式化时间范围
const formattedTimeRange = computed(() => {
  const startTime = secondsToMinutesSeconds(currentSegmentStart.value)
  const endTime = secondsToMinutesSeconds(currentSegmentEnd.value)
  return `${startTime.minutes}:${String(startTime.seconds).padStart(2, '0')} - ${endTime.minutes}:${String(endTime.seconds).padStart(2, '0')}`
})

// 格式化最大时间
const formatMaxTime = computed(() => {
  const { minutes, seconds } = secondsToMinutesSeconds(props.maxDuration)
  return `${minutes}:${String(seconds).padStart(2, '0')}`
})

// 处理滑块变化
function handleSliderChange(event: Event) {
  const target = event.target as HTMLInputElement
  const segmentIndex = parseInt(target.value, 10)
  const startTime = segmentIndex * props.segmentDuration
  const validStartTime = Math.min(startTime, props.maxDuration - props.segmentDuration)
  emit('change', Math.max(0, validStartTime))
}
</script>

<style scoped>
/* ECharts 容器样式 */
</style>
