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
        <div class="space-y-1">
          <div
            v-for="attr in attributes"
            :key="attr"
            class="flex items-center gap-2 p-1 rounded text-xs"
            :class="getMatchClass(hero.matches[attr])"
          >
            <span class="font-medium">{{ getAttributeLabel(attr) }}:</span>
            <span class="font-semibold">{{ getAttributeDisplayValue(hero.name, attr, hero.matches[attr]) }}</span>
            <span v-if="hero.matches[attr] === 'full'" class="ml-auto">✓</span>
            <span v-else-if="hero.matches[attr] === 'partial'" class="ml-auto">~</span>
          </div>
        </div>
        
        <!-- 匹配数量 -->
        <div class="mt-2 text-center text-xs text-gray-600">
          已匹配 {{ Math.round(hero.matchedCount) }}/{{ attributes.length }}
          <span v-if="hero.matchedCount % 1 !== 0" class="text-blue-600">(含部分匹配)</span>
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
        <div class="space-y-1">
          <div
            v-for="attr in attributes"
            :key="attr"
            class="flex items-center gap-2 p-1 rounded text-xs bg-green-500 text-white"
          >
            <span class="font-medium">{{ getAttributeLabel(attr) }}:</span>
            <span class="font-semibold">{{ getAttributeValue(targetHero.name, attr) }}</span>
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
import { getRoleDisplayString } from '../utils/heroUtils'

interface GuessedHero {
  name: string
  matches: Record<string, 'full' | 'partial' | 'none'>
  matchedCount: number
}

const props = defineProps<{
  guessedHeroes: GuessedHero[]
  targetHero?: {
    name: string
    [key: string]: any
  } | null
  gameOver?: boolean
  gameWon?: boolean
  attributes?: readonly string[]
  attributeLabels?: Record<string, string>
  heroesData?: Array<{
    name: string
    [key: string]: any
  }>
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
  return Math.max(...props.guessedHeroes.map(h => {
    // 计算最佳匹配数量（完全匹配=1，部分匹配=0.5）
    let count = 0
    Object.values(h.matches).forEach(m => {
      if (m === 'full') count += 1
      else if (m === 'partial') count += 0.5
    })
    return count
  }))
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

function getAttributeValue(heroName: string, attr: string): string {
  // 优先从 heroesData 中查找
  if (props.heroesData) {
    const hero = props.heroesData.find(h => h.name === heroName)
    if (hero && hero[attr]) return hero[attr]
  }
  // 如果目标英雄直接包含属性，使用目标英雄的属性
  if (props.targetHero && props.targetHero.name === heroName && props.targetHero[attr]) {
    return props.targetHero[attr]
  }
  return '?'
}

function getAttributeDisplayValue(
  heroName: string,
  attr: string,
  matchStatus: 'full' | 'partial' | 'none'
): string {
  // 对于角色属性，需要特殊处理显示
  if (attr === 'role' && props.targetHero) {
    const guessedRole = getAttributeValue(heroName, attr)
    const targetRole = getAttributeValue(props.targetHero.name, attr)
    // 确保两个角色值都存在
    if (guessedRole && targetRole && guessedRole !== '?' && targetRole !== '?') {
      return getRoleDisplayString(guessedRole, targetRole, matchStatus)
    }
  }
  // 其他属性正常显示
  return getAttributeValue(heroName, attr)
}

function getMatchClass(match: 'full' | 'partial' | 'none'): string {
  if (match === 'full') {
    return 'bg-green-500 text-white'
  } else if (match === 'partial') {
    return 'bg-blue-500 text-white'
  } else {
    return 'bg-gray-200 text-gray-600'
  }
}
</script>
