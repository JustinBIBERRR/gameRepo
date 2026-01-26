<template>
  <div class="w-full bg-gray-50 rounded-lg p-4 border border-gray-200">
    <h3 class="text-lg font-semibold text-gray-900 mb-4 text-center">猜测轨迹</h3>
    
    <!-- SVG 地图容器 -->
    <div class="relative w-full" style="height: 400px;">
      <svg
        viewBox="0 0 1000 800"
        class="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <!-- 简化的中国地图轮廓（矩形表示） -->
        <rect
          x="100"
          y="100"
          width="800"
          height="600"
          fill="#f0f0f0"
          stroke="#ccc"
          stroke-width="2"
          rx="10"
        />
        
        <!-- 已猜城市标记 -->
        <g v-for="(city, index) in guessedCities" :key="city.name">
          <!-- 连接线（如果有多于一个城市） -->
          <line
            v-if="index > 0"
            :x1="getX(guessedCities[index - 1].longitude)"
            :y1="getY(guessedCities[index - 1].latitude)"
            :x2="getX(city.longitude)"
            :y2="getY(city.latitude)"
            :stroke="getLineColor()"
            stroke-width="2"
            stroke-dasharray="5,5"
            opacity="0.6"
          />
          
          <!-- 城市标记点 -->
          <circle
            :cx="getX(city.longitude)"
            :cy="getY(city.latitude)"
            :r="getCityRadius(index)"
            :fill="getCityColor(city.distance)"
            :stroke="getCityColor(city.distance)"
            stroke-width="2"
            class="cursor-pointer transition-all duration-300 hover:scale-125"
            @mouseenter="hoveredCity = city.name"
            @mouseleave="hoveredCity = null"
          />
          
          <!-- 城市标签 -->
          <text
            v-if="hoveredCity === city.name || index === guessedCities.length - 1"
            :x="getX(city.longitude)"
            :y="getY(city.latitude) - 15"
            text-anchor="middle"
            class="text-xs font-semibold fill-gray-800"
            style="pointer-events: none;"
          >
            {{ city.name }}
          </text>
        </g>
        
        <!-- 目标城市标记（游戏结束后显示） -->
        <g v-if="targetCity && (gameOver || gameWon)">
          <circle
            :cx="getX(targetCity.longitude)"
            :cy="getY(targetCity.latitude)"
            r="12"
            fill="none"
            stroke="#ef4444"
            stroke-width="3"
            class="animate-pulse"
          />
          <circle
            :cx="getX(targetCity.longitude)"
            :cy="getY(targetCity.latitude)"
            r="8"
            fill="#ef4444"
          />
          <text
            :x="getX(targetCity.longitude)"
            :y="getY(targetCity.latitude) - 20"
            text-anchor="middle"
            class="text-sm font-bold fill-red-600"
          >
            {{ targetCity.name }}（目标）
          </text>
        </g>
      </svg>
      
      <!-- 图例 -->
      <div class="absolute bottom-4 left-4 bg-white/90 rounded-lg p-2 text-xs shadow-sm">
        <div class="flex items-center gap-2 mb-1">
          <div class="w-3 h-3 rounded-full bg-green-500"></div>
          <span>很近（&lt;500km）</span>
        </div>
        <div class="flex items-center gap-2 mb-1">
          <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span>较近（500-1000km）</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-red-500"></div>
          <span>较远（&gt;1000km）</span>
        </div>
      </div>
    </div>
    
    <!-- 距离信息 -->
    <div v-if="guessedCities.length > 0" class="mt-4 space-y-2">
      <div
        v-for="city in guessedCities"
        :key="city.name"
        class="flex items-center justify-between p-2 bg-white rounded border"
        :class="getDistanceBorderClass(city.distance)"
      >
        <span class="text-sm font-medium">{{ city.name }}</span>
        <span class="text-sm text-gray-600">
          距离目标: <span class="font-semibold">{{ city.distance }}km</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

interface City {
  name: string
  latitude: number
  longitude: number
  distance?: number
}

const props = defineProps<{
  guessedCities: City[]
  targetCity?: City | null
  gameOver?: boolean
  gameWon?: boolean
}>()

const hoveredCity = ref<string | null>(null)

// 将经纬度转换为 SVG 坐标
// 中国大致范围：纬度 18°-54°，经度 73°-135°
function getX(longitude: number): number {
  // 经度范围 73-135，映射到 150-950
  return 150 + ((longitude - 73) / (135 - 73)) * 800
}

function getY(latitude: number): number {
  // 纬度范围 18-54，映射到 650-150（注意Y轴向下）
  return 650 - ((latitude - 18) / (54 - 18)) * 500
}

function getCityColor(distance?: number): string {
  if (distance === undefined) return '#6b7280'
  if (distance < 500) return '#10b981' // 绿色 - 很近
  if (distance < 1000) return '#f59e0b' // 黄色 - 较近
  return '#ef4444' // 红色 - 较远
}

function getCityRadius(cityIndex: number): number {
  // 最后一个城市标记稍大
  return cityIndex === props.guessedCities.length - 1 ? 8 : 6
}

function getLineColor(): string {
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444']
  return colors[Math.floor(Math.random() * colors.length)]
}

function getDistanceBorderClass(distance?: number): string {
  if (distance === undefined) return 'border-gray-300'
  if (distance < 500) return 'border-green-300 bg-green-50'
  if (distance < 1000) return 'border-yellow-300 bg-yellow-50'
  return 'border-red-300 bg-red-50'
}
</script>
