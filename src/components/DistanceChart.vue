<template>
  <div class="w-full bg-gray-50 rounded-lg p-4 border border-gray-200">
    <h3 class="text-lg font-semibold text-gray-900 mb-4 text-center">距离变化趋势</h3>
    
    <!-- 图表容器 -->
    <div class="relative w-full" style="height: 250px;">
      <svg
        viewBox="0 0 400 200"
        class="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <!-- 网格线 -->
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        <!-- Y轴标签（距离） -->
        <g v-if="maxDistance > 0">
          <text
            v-for="(label, index) in yAxisLabels"
            :key="index"
            :x="10"
            :y="getYPosition(label)"
            text-anchor="end"
            class="text-xs fill-gray-600"
            dominant-baseline="middle"
          >
            {{ label }}km
          </text>
        </g>
        
        <!-- X轴标签（尝试次数） -->
        <g v-if="distances.length > 0">
          <text
            v-for="(_, index) in distances"
            :key="index"
            :x="getXPosition(index)"
            :y="190"
            text-anchor="middle"
            class="text-xs fill-gray-600"
          >
            {{ index + 1 }}
          </text>
        </g>
        
        <!-- 距离折线 -->
        <polyline
          v-if="distances.length > 1"
          :points="linePoints"
          fill="none"
          stroke="#3b82f6"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        
        <!-- 数据点 -->
        <template v-for="(distance, index) in distances" :key="index">
          <g v-if="distance !== undefined">
            <circle
              :cx="getXPosition(index)"
              :cy="getYPosition(distance)"
              :r="6"
              :fill="getPointColor(distance)"
              :stroke="getPointColor(distance)"
              stroke-width="2"
              class="cursor-pointer transition-all duration-300 hover:scale-125"
              @mouseenter="hoveredIndex = index"
              @mouseleave="hoveredIndex = null"
            />
            
            <!-- 悬停提示 -->
            <g v-if="hoveredIndex === index">
              <rect
                :x="getXPosition(index) - 40"
                :y="getYPosition(distance) - 35"
                width="80"
                height="25"
                fill="#1f2937"
                rx="4"
                opacity="0.9"
              />
              <text
                :x="getXPosition(index)"
                :y="getYPosition(distance) - 20"
                text-anchor="middle"
                class="text-xs fill-white font-semibold"
              >
                {{ cities[index] }}: {{ distance }}km
              </text>
            </g>
          </g>
        </template>
        
        <!-- 目标线（游戏结束后显示） -->
        <line
          v-if="targetDistance !== null && targetDistance !== undefined && (gameOver || gameWon)"
          x1="50"
          :y1="getYPosition(targetDistance)"
          x2="350"
          :y2="getYPosition(targetDistance)"
          stroke="#ef4444"
          stroke-width="2"
          stroke-dasharray="5,5"
          opacity="0.6"
        />
        <text
          v-if="targetDistance !== null && targetDistance !== undefined && (gameOver || gameWon)"
          x="355"
          :y="getYPosition(targetDistance)"
          text-anchor="start"
          class="text-xs fill-red-600 font-semibold"
          dominant-baseline="middle"
        >
          目标距离
        </text>
      </svg>
    </div>
    
    <!-- 距离信息列表 -->
    <div v-if="distances.length > 0" class="mt-4 space-y-2">
      <template v-for="(distance, index) in distances" :key="index">
        <div
          v-if="distance !== undefined"
          class="flex items-center justify-between p-2 bg-white rounded border transition-all duration-300"
          :class="getDistanceBorderClass(distance, index)"
        >
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-gray-500 w-6">#{{ index + 1 }}</span>
            <span class="text-sm font-medium text-gray-900">{{ cities[index] }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-600">
              <span class="font-semibold">{{ distance }}km</span>
            </span>
            <!-- 趋势箭头 -->
            <span v-if="index > 0 && distances[index - 1] !== undefined" class="text-lg">
              <span v-if="distance < distances[index - 1]!" class="text-green-500">↓</span>
              <span v-else-if="distance > distances[index - 1]!" class="text-red-500">↑</span>
              <span v-else class="text-gray-400">→</span>
            </span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  cities: string[]
  distances: number[]
  targetDistance?: number | null
  gameOver?: boolean
  gameWon?: boolean
}>()

const hoveredIndex = ref<number | null>(null)

const maxDistance = computed(() => {
  if (props.distances.length === 0) return 0
  const max = Math.max(...props.distances.filter(d => d !== undefined))
  const target = props.targetDistance ?? 0
  return Math.max(max, target) * 1.1 // 增加10%的边距
})

const yAxisLabels = computed(() => {
  if (maxDistance.value === 0) return []
  const step = Math.ceil(maxDistance.value / 5 / 100) * 100 // 向上取整到100的倍数
  const labels: number[] = []
  for (let i = 0; i <= 5; i++) {
    labels.push(step * i)
  }
  return labels.filter(label => label <= maxDistance.value)
})

const linePoints = computed(() => {
  return props.distances
    .filter(distance => distance !== undefined)
    .map((distance, index) => `${getXPosition(index)},${getYPosition(distance!)}`)
    .join(' ')
})

function getXPosition(index: number): number {
  if (props.distances.length === 0) return 0
  const padding = 50
  const width = 300
  const step = props.distances.length > 1 ? width / (props.distances.length - 1) : 0
  return padding + index * step
}

function getYPosition(distance: number): number {
  if (maxDistance.value === 0) return 150
  const padding = 20
  const height = 150
  return padding + height - (distance / maxDistance.value) * height
}

function getPointColor(distance: number): string {
  if (distance < 500) return '#10b981' // 绿色 - 很近
  if (distance < 1000) return '#f59e0b' // 黄色 - 较近
  return '#ef4444' // 红色 - 较远
}

function getDistanceBorderClass(distance: number, index: number): string {
  const isLast = index === props.distances.length - 1
  if (distance < 500) {
    return isLast ? 'border-green-500 bg-green-50 border-2' : 'border-green-300 bg-green-50'
  }
  if (distance < 1000) {
    return isLast ? 'border-yellow-500 bg-yellow-50 border-2' : 'border-yellow-300 bg-yellow-50'
  }
  return isLast ? 'border-red-500 bg-red-50 border-2' : 'border-red-300 bg-red-50'
}
</script>
