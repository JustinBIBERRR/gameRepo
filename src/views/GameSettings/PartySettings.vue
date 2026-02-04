<template>
  <div class="min-h-screen">
    <Navigation />
    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-6">
        <router-link
          to="/settings"
          class="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          返回配置管理
        </router-link>
      </div>

      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">年会活动配置</h1>
        <p class="text-gray-600">配置数据过期、随机奖惩与随机抽人名单</p>
      </div>

      <!-- 数据过期 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">数据过期</h2>
        <div class="space-y-3 max-w-xs">
          <label class="block text-sm font-medium text-gray-700">数据过期天数</label>
          <div class="flex items-center gap-2">
            <input
              v-model.number="expirationDays"
              type="number"
              min="1"
              max="365"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @change="handleExpirationChange"
            />
            <span class="text-sm text-gray-600">天</span>
          </div>
          <p class="text-xs text-gray-500">范围 1–365 天，超过此天数未修改的自定义数据将自动清除</p>
        </div>
      </div>

      <!-- 随机奖惩 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">随机奖惩</h2>
        <p class="text-sm text-gray-600 mb-4">至少配置 3 条方可使用抽奖。奖励用绿色、惩罚用红色区分。</p>
        <div class="overflow-x-auto">
          <table class="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">类型</th>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">内容</th>
                <th class="px-4 py-2 w-24 text-right text-sm font-medium text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in rewardsPunishments"
                :key="item.id"
                class="border-t border-gray-200 hover:bg-gray-50"
              >
                <td class="px-4 py-2">
                  <span
                    class="inline-flex px-2 py-0.5 text-xs font-medium rounded"
                    :class="item.type === 'reward' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                  >
                    {{ item.type === 'reward' ? '奖励' : '惩罚' }}
                  </span>
                </td>
                <td class="px-4 py-2 text-sm text-gray-900">{{ item.text }}</td>
                <td class="px-4 py-2 text-right">
                  <button
                    type="button"
                    class="text-red-600 hover:text-red-800 text-sm"
                    @click="removeRewardPunishment(item.id)"
                  >
                    删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          <input
            v-model="newRPText"
            type="text"
            placeholder="例如：唱一首歌"
            class="flex-1 min-w-[120px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            @keydown.enter="addRewardPunishment('reward')"
          />
          <button
            type="button"
            class="px-4 py-2 rounded-lg bg-green-100 text-green-800 hover:bg-green-200 text-sm font-medium"
            @click="addRewardPunishment('reward')"
          >
            添加奖励
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-lg bg-red-100 text-red-800 hover:bg-red-200 text-sm font-medium"
            @click="addRewardPunishment('punishment')"
          >
            添加惩罚
          </button>
        </div>
      </div>

      <!-- 随机抽人 -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">随机抽人名单</h2>
        <p class="text-sm text-gray-600 mb-4">至少配置 3 人方可使用抽人。支持增删改。</p>
        <ul class="space-y-2 mb-4 max-h-60 overflow-y-auto">
          <li
            v-for="p in personnel"
            :key="p.id"
            class="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
          >
            <span class="text-gray-900">{{ p.name }}</span>
            <button
              type="button"
              class="text-red-600 hover:text-red-800 text-sm"
              @click="removePersonnel(p.id)"
            >
              删除
            </button>
          </li>
        </ul>
        <div class="flex gap-2">
          <input
            v-model="newPersonName"
            type="text"
            placeholder="输入姓名"
            class="flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            @keydown.enter="addPersonnel"
          />
          <button
            type="button"
            class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
            @click="addPersonnel"
          >
            添加
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import Navigation from '../../components/Navigation.vue'
import {
  getSettingsMeta,
  updateDataExpirationDays,
  getPartyRewardsPunishments,
  savePartyRewardsPunishments,
  getPartyPersonnel,
  savePartyPersonnel,
  type PartyRewardPunishmentItem,
  type PartyPersonnelItem
} from '../../utils/storageUtils'
import { useModal } from '../../composables/useModal'

const { success: showSuccess } = useModal()

const expirationDays = ref(30)
const rewardsPunishments = ref<PartyRewardPunishmentItem[]>([])
const personnel = ref<PartyPersonnelItem[]>([])
const newRPText = ref('')
const newPersonName = ref('')

function handleExpirationChange() {
  const days = Math.max(1, Math.min(365, expirationDays.value))
  expirationDays.value = days
  updateDataExpirationDays(days)
  showSuccess({ title: '已保存', message: `数据过期天数已设置为 ${days} 天` })
}

function addRewardPunishment(type: 'reward' | 'punishment') {
  const text = newRPText.value.trim()
  if (!text) return
  rewardsPunishments.value.push({
    id: crypto.randomUUID(),
    type,
    text
  })
  savePartyRewardsPunishments(rewardsPunishments.value)
  newRPText.value = ''
  showSuccess({ title: '已添加', message: type === 'reward' ? '已添加奖励' : '已添加惩罚' })
}

function removeRewardPunishment(id: string) {
  rewardsPunishments.value = rewardsPunishments.value.filter((i) => i.id !== id)
  savePartyRewardsPunishments(rewardsPunishments.value)
  showSuccess({ title: '已删除', message: '已删除该条' })
}

function addPersonnel() {
  const name = newPersonName.value.trim()
  if (!name) return
  personnel.value.push({ id: crypto.randomUUID(), name })
  savePartyPersonnel(personnel.value)
  newPersonName.value = ''
  showSuccess({ title: '已添加', message: '已添加人员' })
}

function removePersonnel(id: string) {
  personnel.value = personnel.value.filter((p) => p.id !== id)
  savePartyPersonnel(personnel.value)
  showSuccess({ title: '已删除', message: '已删除该人员' })
}

onMounted(() => {
  const meta = getSettingsMeta()
  expirationDays.value = meta.dataExpirationDays
  rewardsPunishments.value = getPartyRewardsPunishments()
  personnel.value = getPartyPersonnel()
})
</script>
