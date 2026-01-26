<template>
  <div class="overflow-x-auto">
    <!-- 搜索栏 -->
    <div class="mb-4 flex flex-col sm:flex-row gap-2">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索..."
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <div class="text-sm text-gray-600 flex items-center">
        显示 {{ filteredData.length }} / {{ totalCount }} 条
        <span v-if="capacityLimit !== null" class="ml-2">
          ({{ currentCount }}/{{ capacityLimit }})
        </span>
      </div>
    </div>

    <!-- 表格 -->
    <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              v-for="field in displayFields"
              :key="field.key"
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ field.label }}
            </th>
            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              操作
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="(item, index) in paginatedData"
            :key="getItemKey(item, index)"
            class="hover:bg-gray-50 transition-colors"
          >
            <td
              v-for="field in displayFields"
              :key="field.key"
              class="px-4 py-3 text-sm text-gray-900"
            >
              <span v-if="field.type === 'array'">
                {{ Array.isArray(item[field.key]) ? item[field.key].join(', ') : '' }}
              </span>
              <span v-else-if="field.type === 'boolean'">
                {{ item[field.key] ? '是' : '否' }}
              </span>
              <span v-else>
                {{ item[field.key] || '-' }}
              </span>
            </td>
            <td class="px-4 py-3 text-right text-sm font-medium">
              <button
                @click="$emit('edit', item)"
                class="text-blue-600 hover:text-blue-900 mr-3"
              >
                编辑
              </button>
              <button
                @click="$emit('delete', item)"
                class="text-red-600 hover:text-red-900"
              >
                删除
              </button>
            </td>
          </tr>
          <tr v-if="paginatedData.length === 0">
            <td :colspan="displayFields.length + 1" class="px-4 py-8 text-center text-gray-500">
              暂无数据
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="mt-4 flex items-center justify-between">
      <div class="text-sm text-gray-600">
        第 {{ currentPage }} / {{ totalPages }} 页
      </div>
      <div class="flex gap-2">
        <button
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          上一页
        </button>
        <button
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GameDataSchema } from '../../schemas/types'

const props = defineProps<{
  schema: GameDataSchema
  data: Record<string, any>[]
  pageSize?: number
  capacityLimit?: number | null
  currentCount?: number
}>()

// emit 在模板中使用 ($emit)，但 TypeScript 检测不到
// @ts-ignore - emit 在模板中使用
defineEmits<{
  edit: [item: Record<string, any>]
  delete: [item: Record<string, any>]
}>()

const searchQuery = ref('')
const currentPage = ref(1)

const displayFields = computed(() => {
  // 显示前5个字段作为表格列
  return props.schema.fields.slice(0, 5)
})

const filteredData = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.data
  }
  
  const query = searchQuery.value.toLowerCase()
  return props.data.filter(item => {
    return props.schema.fields.some(field => {
      const value = item[field.key]
      if (value === null || value === undefined) return false
      
      if (field.type === 'array' && Array.isArray(value)) {
        return value.some(v => String(v).toLowerCase().includes(query))
      }
      
      return String(value).toLowerCase().includes(query)
    })
  })
})

const totalCount = computed(() => props.data.length)
const pageSize = computed(() => props.pageSize || 10)
const totalPages = computed(() => Math.ceil(filteredData.value.length / pageSize.value))

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

function getItemKey(item: Record<string, any>, index: number): string {
  const primaryKey = props.schema.primaryKey
  return item[primaryKey] || `item-${index}`
}

// 搜索时重置到第一页
watch(searchQuery, () => {
  currentPage.value = 1
})
</script>
