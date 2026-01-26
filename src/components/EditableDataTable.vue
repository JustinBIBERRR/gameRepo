<template>
  <div class="editable-data-table">
    <!-- 工具栏 -->
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索数据..."
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <span class="text-sm text-gray-600">
          显示 {{ filteredData.length }} / {{ data.length }} 条
        </span>
      </div>
      <div class="flex gap-2">
        <button
          @click="handleAddRow"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          + 新增
        </button>
      </div>
    </div>

    <!-- 表格 -->
    <div class="w-full overflow-x-auto border border-gray-200 rounded-lg">
      <table class="w-full divide-y divide-gray-200" style="table-layout: auto; width: 100%;">
        <thead class="bg-gray-50">
          <tr>
            <th
              v-for="field in displayFields"
              :key="field.key"
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ field.label }}
            </th>
            <th class="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-24">
              操作
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="(item, index) in filteredData"
            :key="getItemKey(item, index)"
            class="hover:bg-gray-50"
          >
            <td
              v-for="field in displayFields"
              :key="field.key"
              class="px-4 py-3 text-sm"
            >
              <!-- 文件类型不可直接编辑 -->
              <span v-if="field.type === 'file'" class="text-gray-700">
                {{ formatCellValue(item[field.key], field.type) }}
              </span>
              <!-- 可编辑单元格 -->
              <template v-else>
                <input
                  v-if="isEditing(item, field.key)"
                  v-model="editingValues[`${index}-${field.key}`]"
                  type="text"
                  class="w-full px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  @blur="handleCellBlur(item, field.key, index)"
                  @keyup.enter="handleCellBlur(item, field.key, index)"
                  @keyup.esc="cancelEdit(item, field.key, index)"
                />
                <span
                  v-else
                  @dblclick="startEdit(item, field.key, index)"
                  class="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded"
                >
                  {{ formatCellValue(item[field.key], field.type) }}
                </span>
              </template>
            </td>
            <td class="px-3 py-3 text-right text-sm font-medium w-24">
              <div class="flex items-center justify-end gap-2 whitespace-nowrap">
                <button
                  @click="handleEditRow(item, index)"
                  class="text-blue-600 hover:text-blue-900 flex-shrink-0 px-1"
                >
                  编辑
                </button>
                <button
                  @click="handleDeleteRow(index)"
                  class="text-red-600 hover:text-red-900 flex-shrink-0 px-1"
                >
                  删除
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredData.length === 0">
            <td :colspan="displayFields.length + 1" class="px-4 py-8 text-center text-gray-500">
              暂无数据
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GameDataSchema, FieldSchema } from '../schemas/types'

const props = defineProps<{
  schema: GameDataSchema
  data: Record<string, any>[]
}>()

const emit = defineEmits<{
  'update:data': [data: Record<string, any>[]]
  'edit': [item: Record<string, any>]
}>()

const searchQuery = ref('')
const editingValues = ref<Record<string, any>>({})
const editingCell = ref<string | null>(null)
const editingRow = ref<number | null>(null)

const displayFields = computed(() => {
  // 如果是电影游戏，只显示 name, description, hint 字段
  if (props.schema.id === 'movie') {
    return props.schema.fields.filter(field => 
      ['name', 'description', 'hint'].includes(field.key)
    )
  }
  // 其他游戏显示前5个字段
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

function getItemKey(item: Record<string, any>, index: number): string {
  const primaryKey = props.schema.primaryKey
  return item[primaryKey] || `item-${index}`
}

function formatCellValue(value: any, type: string): string {
  if (value === null || value === undefined) return '-'
  
  if (type === 'array' && Array.isArray(value)) {
    return value.join(', ')
  }
  
  if (type === 'boolean') {
    return value ? '是' : '否'
  }
  
  if (type === 'file') {
    if (value instanceof File) {
      return value.name
    }
    if (typeof value === 'string') {
      return value.split('/').pop() || value
    }
    return '已上传'
  }
  
  return String(value)
}

function isEditing(item: Record<string, any>, fieldKey: string): boolean {
  const index = props.data.indexOf(item)
  return editingCell.value === `${index}-${fieldKey}`
}

function startEdit(item: Record<string, any>, fieldKey: string, index: number) {
  const cellKey = `${index}-${fieldKey}`
  editingCell.value = cellKey
  const value = item[fieldKey]
  
  if (Array.isArray(value)) {
    editingValues.value[cellKey] = value.join(', ')
  } else {
    editingValues.value[cellKey] = value
  }
}

function handleCellBlur(item: Record<string, any>, fieldKey: string, index: number) {
  const cellKey = `${index}-${fieldKey}`
  const field = props.schema.fields.find(f => f.key === fieldKey)
  if (!field) return
  
  let newValue: any = editingValues.value[cellKey]
  
  // 类型转换
  if (field.type === 'number') {
    newValue = parseFloat(newValue) || 0
  } else if (field.type === 'boolean') {
    newValue = Boolean(newValue)
  } else if (field.type === 'array') {
    newValue = String(newValue).split(',').map(v => v.trim()).filter(v => v)
  }
  
  // 更新数据
  const newData = [...props.data]
  newData[index] = {
    ...newData[index],
    [fieldKey]: newValue
  }
  
  emit('update:data', newData)
  editingCell.value = null
  delete editingValues.value[cellKey]
}

function cancelEdit(item: Record<string, any>, fieldKey: string, index: number) {
  const cellKey = `${index}-${fieldKey}`
  editingCell.value = null
  delete editingValues.value[cellKey]
}

function handleAddRow() {
  emit('edit', null) // 传递 null 表示新增
}

function handleEditRow(item: Record<string, any>, index: number) {
  emit('edit', { ...item })
}

function handleDeleteRow(index: number) {
  const newData = props.data.filter((_, i) => i !== index)
  emit('update:data', newData)
}
</script>

<style scoped>
.editable-data-table {
  @apply w-full;
}

.editable-data-table table {
  table-layout: auto;
  width: 100%;
}

.editable-data-table th:last-child,
.editable-data-table td:last-child {
  width: 96px;
  min-width: 96px;
  max-width: 96px;
}
</style>
