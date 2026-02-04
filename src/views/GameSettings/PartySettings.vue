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
          {{ t('settings.backToSettings') }}
        </router-link>
      </div>

      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ t('settings.partyPageTitle') }}</h1>
        <p class="text-gray-600">{{ t('settings.partyPageDesc') }}</p>
      </div>

      <!-- 数据过期 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ t('settings.dataExpiry') }}</h2>
        <div class="space-y-3 max-w-xs">
          <label class="block text-sm font-medium text-gray-700">{{ t('settings.expirationDays') }}</label>
          <div class="flex items-center gap-2">
            <input
              v-model.number="expirationDays"
              type="number"
              min="1"
              max="365"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @change="handleExpirationChange"
            />
            <span class="text-sm text-gray-600">{{ t('settings.days') }}</span>
          </div>
          <p class="text-xs text-gray-500">{{ t('settings.expirationHint') }}</p>
        </div>
      </div>

      <!-- 随机奖惩 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ t('settings.rewardsPunishments') }}</h2>
        <p class="text-sm text-gray-600 mb-4">{{ t('settings.rewardsPunishmentsHint') }}</p>
        <div class="overflow-x-auto">
          <table class="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">{{ t('settings.type') }}</th>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">{{ t('settings.content') }}</th>
                <th class="px-4 py-2 w-24 text-right text-sm font-medium text-gray-700">{{ t('common.actions') }}</th>
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
                    {{ item.type === 'reward' ? t('settings.reward') : t('settings.punishment') }}
                  </span>
                </td>
                <td class="px-4 py-2 text-sm text-gray-900">{{ item.text }}</td>
                <td class="px-4 py-2 text-right">
                  <button
                    type="button"
                    class="text-red-600 hover:text-red-800 text-sm"
                    @click="removeRewardPunishment(item.id)"
                  >
                    {{ t('common.delete') }}
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
            :placeholder="t('settings.placeholderReward')"
            class="flex-1 min-w-[120px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            @keydown.enter="addRewardPunishment('reward')"
          />
          <button
            type="button"
            class="px-4 py-2 rounded-lg bg-green-100 text-green-800 hover:bg-green-200 text-sm font-medium"
            @click="addRewardPunishment('reward')"
          >
            {{ t('settings.addReward') }}
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-lg bg-red-100 text-red-800 hover:bg-red-200 text-sm font-medium"
            @click="addRewardPunishment('punishment')"
          >
            {{ t('settings.addPunishment') }}
          </button>
        </div>
      </div>

      <!-- 随机抽人 -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ t('settings.drawPeopleListTitle') }}</h2>
        <p class="text-sm text-gray-600 mb-4">{{ t('settings.peopleListHint') }}</p>
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
              {{ t('common.delete') }}
            </button>
          </li>
        </ul>
        <div class="flex gap-2">
          <input
            v-model="newPersonName"
            type="text"
            :placeholder="t('settings.placeholderPerson')"
            class="flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            @keydown.enter="addPersonnel"
          />
          <button
            type="button"
            class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
            @click="addPersonnel"
          >
            {{ t('common.add') }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Navigation from '../../components/Navigation.vue'

const { t } = useI18n()
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
  showSuccess({ title: t('settings.saved'), message: t('settings.expirationSaved', { days }) })
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
  showSuccess({ title: t('common.added'), message: type === 'reward' ? t('settings.addedReward') : t('settings.addedPunishment') })
}

function removeRewardPunishment(id: string) {
  rewardsPunishments.value = rewardsPunishments.value.filter((i) => i.id !== id)
  savePartyRewardsPunishments(rewardsPunishments.value)
  showSuccess({ title: t('common.removed'), message: t('settings.removedItem') })
}

function addPersonnel() {
  const name = newPersonName.value.trim()
  if (!name) return
  personnel.value.push({ id: crypto.randomUUID(), name })
  savePartyPersonnel(personnel.value)
  newPersonName.value = ''
  showSuccess({ title: t('common.added'), message: t('settings.addedPerson') })
}

function removePersonnel(id: string) {
  personnel.value = personnel.value.filter((p) => p.id !== id)
  savePartyPersonnel(personnel.value)
  showSuccess({ title: t('common.removed'), message: t('settings.removedPerson') })
}

onMounted(() => {
  const meta = getSettingsMeta()
  expirationDays.value = meta.dataExpirationDays
  rewardsPunishments.value = getPartyRewardsPunishments()
  personnel.value = getPartyPersonnel()
})
</script>
