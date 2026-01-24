<template>
  <div class="w-full">
    <!-- 尝试次数进度条 -->
    <div class="mb-2">
      <div class="flex justify-between items-center mb-1">
        <span class="text-sm font-medium text-gray-700">尝试次数</span>
        <span class="text-sm font-semibold text-gray-900">
          {{ current }} / {{ max }}
        </span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-500 ease-out"
          :class="progressBarClass"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
    </div>
    
    <!-- 接近度提示（可选） -->
    <div v-if="closeness !== null" class="mt-3">
      <div class="flex items-center gap-2">
        <div class="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500"
            :style="{ width: `${closeness}%` }"
          ></div>
        </div>
        <span class="text-xs text-gray-600 min-w-[60px] text-right">
          {{ closenessText }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  current: number
  max: number
  closeness?: number | null // 0-100，表示接近目标的百分比
  closenessText?: string
}>(), {
  closeness: null,
  closenessText: '接近度'
})

const progressPercentage = computed(() => {
  return Math.min((props.current / props.max) * 100, 100)
})

const progressBarClass = computed(() => {
  const percentage = progressPercentage.value
  if (percentage >= 80) {
    return 'bg-red-500'
  } else if (percentage >= 60) {
    return 'bg-orange-500'
  } else if (percentage >= 40) {
    return 'bg-yellow-500'
  } else {
    return 'bg-blue-500'
  }
})
</script>
