<template>
  <div class="w-full bg-gray-50 rounded-lg p-4 border border-gray-200">
    <h3 class="text-lg font-semibold text-gray-900 mb-4 text-center">猜测历史</h3>
    
    <!-- 网格布局 -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      <div
        v-for="(hero, index) in guessedHeroes"
        :key="index"
        class="bg-white rounded-lg p-3 border-2 transition-all duration-300 hover:shadow-md"
        :class="getHeroCardClass(hero.matchedCount)"
      >
        <!-- 英雄名称 -->
        <div class="font-semibold text-gray-900 mb-2 text-center">
          {{ hero.name }}
        </div>
        
        <!-- 属性匹配状态 -->
        <div class="grid grid-cols-5 gap-1">
          <div
            v-for="attr in attributes"
            :key="attr"
            class="aspect-square rounded flex items-center justify-center text-xs"
            :class="hero.matches[attr] ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'"
            :title="getAttributeLabel(attr)"
          >
            {{ getAttributeIcon(attr) }}
          </div>
        </div>
        
        <!-- 匹配数量 -->
        <div class="mt-2 text-center text-xs text-gray-600">
          已匹配 {{ hero.matchedCount }}/{{ attributes.length }}
        </div>
      </div>
    </div>
    
    <!-- 目标英雄（游戏结束后显示） -->
    <div v-if="targetHero && (gameOver || gameWon)" class="mt-4 pt-4 border-t border-gray-300">
      <div class="text-center mb-2">
        <span class="text-sm font-semibold text-red-600">目标英雄</span>
      </div>
      <div class="bg-white rounded-lg p-3 border-2 border-red-500">
        <div class="font-bold text-lg text-gray-900 mb-2 text-center">
          {{ targetHero.name }}
        </div>
        <div class="grid grid-cols-5 gap-1">
          <div
            v-for="attr in attributes"
            :key="attr"
            class="aspect-square rounded flex items-center justify-center text-xs bg-green-500 text-white"
            :title="getAttributeLabel(attr)"
          >
            {{ getAttributeIcon(attr) }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 进度提示 -->
    <div v-if="guessedHeroes.length > 0" class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div class="text-sm text-blue-900">
        <span class="font-semibold">提示：</span>
        已尝试 {{ guessedHeroes.length }} 个英雄，
        <span v-if="bestMatchCount > 0">
          最佳匹配 {{ bestMatchCount }}/{{ attributes.length }} 个属性
        </span>
        <span v-else>继续尝试！</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface GuessedHero {
  name: string
  matches: Record<string, boolean>
  matchedCount: number
}

const props = defineProps<{
  guessedHeroes: GuessedHero[]
  targetHero?: {
    name: string
  } | null
  gameOver?: boolean
  gameWon?: boolean
  attributes?: readonly string[]
  attributeLabels?: Record<string, string>
}>()

const attributes = computed(() => props.attributes || ['role', 'era', 'nationality', 'human', 'gender'])

const attributeLabels = computed(() => props.attributeLabels || {
  role: '职业',
  era: '年代',
  nationality: '国籍',
  human: '人类',
  gender: '性别'
})

const bestMatchCount = computed(() => {
  if (props.guessedHeroes.length === 0) return 0
  return Math.max(...props.guessedHeroes.map(h => h.matchedCount))
})

function getHeroCardClass(matchedCount: number): string {
  if (matchedCount >= 4) return 'border-green-500 bg-green-50'
  if (matchedCount >= 3) return 'border-yellow-500 bg-yellow-50'
  if (matchedCount >= 2) return 'border-orange-500 bg-orange-50'
  return 'border-gray-300'
}

function getAttributeLabel(attr: string): string {
  return attributeLabels.value[attr] || attr
}

function getAttributeIcon(attr: string): string {
  const icons: Record<string, string> = {
    role: '⚔️',
    era: '📜',
    nationality: '🌍',
    human: '👤',
    gender: '⚧️'
  }
  return icons[attr] || '?'
}
</script>
