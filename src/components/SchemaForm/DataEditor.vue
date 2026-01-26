<template>
  <div>
    <!-- 工具栏 -->
    <div class="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div class="flex gap-2">
        <button
          @click="handleAdd"
          :disabled="isAtCapacityLimit"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          + 新增
        </button>
        <button
          v-if="useCustom"
          @click="handleReset"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          重置为默认数据
        </button>
      </div>
      
      <div class="flex gap-2">
        <button
          @click="handleExportJSON"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          导出 JSON
        </button>
        <button
          @click="handleImportJSON"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          导入 JSON
        </button>
      </div>
    </div>

    <!-- 容量提示 -->
    <div v-if="isAtCapacityLimit" class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p class="text-sm text-yellow-800">
        ⚠️ 已达 {{ capacityLimit }} 条上限，请删除部分数据后再添加
      </p>
    </div>

    <!-- 数据模式切换 -->
    <div class="mb-4 flex items-center gap-4">
      <span class="text-sm font-medium text-gray-700">数据模式：</span>
      <label class="flex items-center">
        <input
          v-model="useCustom"
          type="radio"
          :value="false"
          @change="handleModeChange(false)"
          class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
        />
        <span class="ml-2 text-sm text-gray-700">使用默认数据</span>
      </label>
      <label class="flex items-center">
        <input
          v-model="useCustom"
          type="radio"
          :value="true"
          @change="handleModeChange(true)"
          class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
        />
        <span class="ml-2 text-sm text-gray-700">使用自定义数据</span>
      </label>
    </div>

    <!-- 数据表格 -->
    <SchemaTable
      :schema="schema"
      :data="currentData"
      :capacity-limit="capacityLimit"
      :current-count="currentData.length"
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <!-- 编辑/新增弹窗 -->
    <GlobalModal
      :show="showModal"
      @close="closeModal"
    >
      <template #header>
        <h3 class="text-lg font-semibold text-gray-900">
          {{ editingItem ? '编辑数据' : '新增数据' }}
        </h3>
      </template>
      <template #body>
        <SchemaForm
          :schema="schema"
          :initial-data="editingItem ?? undefined"
          @submit="handleSubmit"
          @cancel="closeModal"
        />
      </template>
    </GlobalModal>

    <!-- 文件输入（隐藏） -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".json"
      class="hidden"
      @change="handleFileSelect"
    />
  </div>
</template>

<script setup lang="ts">
import SchemaTable from './SchemaTable.vue'
import SchemaForm from './SchemaForm.vue'
import GlobalModal from '../GlobalModal.vue'
import type { GameDataSchema } from '../../schemas/types'
import { useModal } from '../../composables/useModal'

const props = defineProps<{
  schema: GameDataSchema
  defaultData: Record<string, any>[]
  customData: Record<string, any>[]
  modelValue: boolean
  capacityLimit?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:customData': [data: Record<string, any>[]]
  'reset': []
}>()

const useCustom = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const { confirm: showConfirm, success: showSuccess, error: showError } = useModal()

const showModal = ref(false)
const editingItem = ref<Record<string, any> | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const currentData = computed(() => {
  try {
    if (useCustom.value && Array.isArray(props.customData) && props.customData.length > 0) {
      return props.customData
    }
    return Array.isArray(props.defaultData) ? props.defaultData : []
  } catch (error) {
    console.error('获取当前数据失败:', error)
    return []
  }
})

const isAtCapacityLimit = computed(() => {
  if (!props.capacityLimit) return false
  return useCustom.value && props.customData.length >= props.capacityLimit
})

const capacityLimit = computed(() => props.capacityLimit || null)

function handleAdd() {
  if (isAtCapacityLimit.value) {
    showError({
      title: '已达上限',
      message: `数据条数已达 ${capacityLimit.value} 条上限，请删除部分数据后再添加`
    })
    return
  }
  editingItem.value = null
  showModal.value = true
}

function handleEdit(item: Record<string, any>) {
  editingItem.value = { ...item }
  showModal.value = true
}

function handleDelete(item: Record<string, any>) {
  const primaryKey = props.schema.primaryKey
  const itemName = item[primaryKey] || '该项'
  
  showConfirm({
    title: '确认删除',
    message: `确定要删除"${itemName}"吗？此操作不可恢复。`,
    confirmText: '删除',
    cancelText: '取消'
  }).then((confirmed) => {
    if (confirmed) {
      const newData = props.customData.filter(d => {
        return d[props.schema.primaryKey] !== item[props.schema.primaryKey]
      })
      emit('update:customData', newData)
      showSuccess({
        title: '删除成功',
        message: '已删除数据'
      })
    }
  })
}

function handleSubmit(data: Record<string, any>) {
  if (editingItem.value) {
    // 编辑模式
    const primaryKey = props.schema.primaryKey
    const index = props.customData.findIndex(
      d => d[primaryKey] === editingItem.value![primaryKey]
    )
    
    if (index >= 0) {
      const newData = [...props.customData]
      newData[index] = { ...data }
      emit('update:customData', newData)
      showSuccess({
        title: '保存成功',
        message: '数据已更新'
      })
    }
  } else {
    // 新增模式
    // 检查主键是否重复
    const primaryKey = props.schema.primaryKey
    const exists = props.customData.some(
      d => d[primaryKey] === data[primaryKey]
    )
    
    if (exists) {
      showError({
        title: '保存失败',
        message: `${props.schema.fields.find(f => f.key === primaryKey)?.label || '主键'}已存在`
      })
      return
    }
    
    // 检查容量限制
    if (isAtCapacityLimit.value) {
      showError({
        title: '已达上限',
        message: `数据条数已达 ${capacityLimit.value} 条上限，请删除部分数据后再添加`
      })
      return
    }
    
    const newData = [...props.customData, data]
    emit('update:customData', newData)
    showSuccess({
      title: '保存成功',
      message: '数据已添加'
    })
  }
  
  closeModal()
}

function closeModal() {
  showModal.value = false
  editingItem.value = null
}

function handleModeChange(value: boolean) {
  useCustom.value = value
  if (value) {
    // 切换到自定义数据，复制默认数据
    if (props.customData.length === 0) {
      emit('update:customData', [...props.defaultData])
    }
  }
}

function handleReset() {
  showConfirm({
    title: '确认重置',
    message: '确定要重置为默认数据吗？此操作将清除所有自定义数据，且不可恢复。',
    confirmText: '重置',
    cancelText: '取消'
  }).then((confirmed) => {
    if (confirmed) {
      emit('reset')
      useCustom.value = false
      showSuccess({
        title: '重置成功',
        message: '已恢复为默认数据'
      })
    }
  })
}

function handleExportJSON() {
  const dataToExport = useCustom.value ? props.customData : props.defaultData
  const jsonStr = JSON.stringify(dataToExport, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  a.href = url
  a.download = `${props.schema.id}-data-${timestamp}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  showSuccess({
    title: '导出成功',
    message: '数据已导出为 JSON 文件'
  })
}

function handleImportJSON() {
  fileInputRef.value?.click()
}

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  
  try {
    const text = await file.text()
    const importedData = JSON.parse(text)
    
    if (!Array.isArray(importedData)) {
      throw new Error('JSON 格式错误：数据必须是数组')
    }
    
    // 验证数据
    const primaryKey = props.schema.primaryKey
    const errors: string[] = []
    
    for (let i = 0; i < importedData.length; i++) {
      const item = importedData[i]
      if (!item[primaryKey]) {
        errors.push(`第 ${i + 1} 条数据缺少主键字段 "${primaryKey}"`)
      }
    }
    
    if (errors.length > 0) {
      throw new Error(errors.join('\n'))
    }
    
    // 检查容量限制
    if (props.capacityLimit && importedData.length > props.capacityLimit) {
      throw new Error(`数据条数 ${importedData.length} 超过上限 ${props.capacityLimit}`)
    }
    
    // 显示确认对话框
    const confirmed = await showConfirm({
      title: '确认导入',
      message: `即将导入 ${importedData.length} 条数据，这将覆盖现有自定义数据。确定要继续吗？`,
      confirmText: '导入',
      cancelText: '取消'
    })
    
    if (confirmed) {
      emit('update:customData', importedData)
      useCustom.value = true
      showSuccess({
        title: '导入成功',
        message: `已导入 ${importedData.length} 条数据`
      })
    }
    
    // 清空文件输入
    input.value = ''
  } catch (error: any) {
    showError({
      title: '导入失败',
      message: error.message || '无法解析 JSON 文件'
    })
    input.value = ''
  }
}
</script>
