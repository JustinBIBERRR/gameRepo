<template>
  <div class="data-manager">
    <!-- 模式切换和操作栏 -->
    <div class="mb-6 space-y-4">
      <!-- 数据模式切换 -->
      <div v-if="!props.disableJsonEditor" class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <span class="text-sm font-medium text-gray-700">数据模式：</span>
        <label class="flex items-center">
          <input
            v-model="useCustomMode"
            type="radio"
            :value="false"
            @change="handleModeChange(false)"
            class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <span class="ml-2 text-sm text-gray-700">使用默认数据</span>
        </label>
        <label class="flex items-center">
          <input
            v-model="useCustomMode"
            type="radio"
            :value="true"
            @change="handleModeChange(true)"
            class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <span class="ml-2 text-sm text-gray-700">使用自定义数据</span>
        </label>
        <div v-if="useCustomMode" class="ml-auto flex gap-2">
          <button
            @click="handleReset"
            class="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            重置为默认数据
          </button>
          <button
            @click="handleClearAll"
            class="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            清理全部数据
          </button>
        </div>
      </div>
      <!-- 电影游戏专用：只显示清理按钮 -->
      <div v-else class="flex items-center justify-end gap-2 p-4 bg-gray-50 rounded-lg">
        <button
          @click="handleClearAll"
          class="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          清理全部数据
        </button>
      </div>

      <!-- 视图切换 -->
      <div v-if="!props.disableJsonEditor" class="flex items-center gap-2 border-b border-gray-200">
        <button
          @click="activeView = 'table'"
          :class="[
            'px-4 py-2 text-sm font-medium transition-colors',
            activeView === 'table'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          表格视图
        </button>
        <button
          @click="activeView = 'editor'"
          :class="[
            'px-4 py-2 text-sm font-medium transition-colors',
            activeView === 'editor'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          JSON 编辑器
        </button>
      </div>
    </div>

    <!-- JSON 编辑器视图 -->
    <div v-if="!props.disableJsonEditor && activeView === 'editor'">
      <JsonEditor
        v-model="jsonContent"
        :schema="schema"
        @validate="handleJsonValidate"
      />
    </div>

    <!-- 表格视图 -->
    <div v-if="activeView === 'table'">
      <EditableDataTable
        :schema="schema"
        :data="currentData"
        @update:data="handleTableUpdate"
        @edit="handleEditRow"
      />
    </div>

    <!-- 编辑弹窗 -->
    <GlobalModal
      :show="showEditModal"
      @close="closeEditModal"
    >
      <template #header>
        <h3 class="text-lg font-semibold text-gray-900">
          {{ editingItem ? '编辑数据' : '新增数据' }}
        </h3>
      </template>
      <template #body>
        <SchemaForm
          :schema="schema"
          :initial-data="editingItem"
          @submit="handleFormSubmit"
          @cancel="closeEditModal"
        />
      </template>
    </GlobalModal>

    <!-- 同步提示 -->
    <Transition name="fade">
      <div v-if="syncStatus" class="mt-4 p-3 rounded-lg" :class="syncStatusClass">
        <div class="flex items-center gap-2">
          <svg v-if="syncStatus === 'synced'" class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span class="text-sm font-medium">{{ syncStatusMessage }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import JsonEditor from './JsonEditor.vue'
import EditableDataTable from './EditableDataTable.vue'
import SchemaForm from './SchemaForm/SchemaForm.vue'
import GlobalModal from './GlobalModal.vue'
import type { GameDataSchema } from '../schemas/types'
import { useModal } from '../composables/useModal'

const props = defineProps<{
  schema: GameDataSchema
  defaultData: Record<string, any>[]
  customData: Record<string, any>[]
  modelValue: boolean
  disableJsonEditor?: boolean  // 禁用JSON编辑器
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:customData': [data: Record<string, any>[]]
  'reset': []
}>()

const { confirm: showConfirm, success: showSuccess } = useModal()

const useCustomMode = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const activeView = ref<'editor' | 'table'>(
  props.disableJsonEditor ? 'table' : 'table'
)
const jsonContent = ref('')
const syncStatus = ref<'synced' | 'error' | null>(null)
const jsonErrors = ref<Array<{ line: number; message: string }>>([])
const showEditModal = ref(false)
const editingItem = ref<Record<string, any> | null>(null)

const currentData = computed(() => {
  return useCustomMode.value ? props.customData : props.defaultData
})

const syncStatusClass = computed(() => {
  if (syncStatus.value === 'synced') {
    return 'bg-green-50 border border-green-200'
  }
  return 'bg-red-50 border border-red-200'
})

const syncStatusMessage = computed(() => {
  if (syncStatus.value === 'synced') {
    return '数据已同步'
  }
  return '数据同步失败，请检查 JSON 格式'
})

// 初始化 JSON 内容（仅在启用 JSON 编辑器时）
watch(() => currentData.value, () => {
  if (!props.disableJsonEditor) {
    updateJsonFromData()
  }
}, { immediate: true })

function updateJsonFromData() {
  try {
    jsonContent.value = JSON.stringify(currentData.value, null, 2)
  } catch (error) {
    console.error('更新 JSON 失败:', error)
  }
}

function handleJsonValidate(errors: Array<{ line: number; message: string }>) {
  jsonErrors.value = errors
  
  if (errors.length === 0 && jsonContent.value) {
    try {
      const parsed = JSON.parse(jsonContent.value)
      if (Array.isArray(parsed)) {
        emit('update:customData', parsed)
        syncStatus.value = 'synced'
        setTimeout(() => {
          syncStatus.value = null
        }, 2000)
      }
    } catch (error) {
      syncStatus.value = 'error'
    }
  } else {
    syncStatus.value = 'error'
  }
}

function handleTableUpdate(data: Record<string, any>[]) {
  // 如果当前是默认数据模式，切换到自定义数据模式
  if (!useCustomMode.value) {
    useCustomMode.value = true
    // 复制默认数据到自定义数据
    if (props.customData.length === 0) {
      emit('update:customData', [...props.defaultData])
    }
  }
  
  emit('update:customData', data)
  if (!props.disableJsonEditor) {
    updateJsonFromData()
    syncStatus.value = 'synced'
    setTimeout(() => {
      syncStatus.value = null
    }, 2000)
  }
}

function handleEditRow(item: Record<string, any> | null) {
  editingItem.value = item ? { ...item } : null
  showEditModal.value = true
}

function handleFormSubmit(data: Record<string, any>) {
  // 如果当前是默认数据模式，切换到自定义数据模式
  if (!useCustomMode.value) {
    useCustomMode.value = true
    // 复制默认数据到自定义数据
    if (props.customData.length === 0) {
      emit('update:customData', [...props.defaultData])
    }
  }
  
  // 获取当前使用的数据（可能是刚切换后的自定义数据）
  const currentDataList = useCustomMode.value ? props.customData : props.defaultData
  
  if (editingItem.value) {
    // 编辑模式：找到原数据并更新
    const primaryKey = props.schema.primaryKey
    const index = currentDataList.findIndex(
      d => d[primaryKey] === editingItem.value![primaryKey]
    )
    
    if (index >= 0) {
      const newData = [...currentDataList]
      newData[index] = { ...data }
      emit('update:customData', newData)
      if (!props.disableJsonEditor) {
        updateJsonFromData()
      }
      showSuccess({
        title: '保存成功',
        message: '数据已更新'
      })
    }
  } else {
    // 新增模式
    const newData = [...currentDataList, data]
    emit('update:customData', newData)
    if (!props.disableJsonEditor) {
      updateJsonFromData()
    }
    showSuccess({
      title: '保存成功',
      message: '数据已添加'
    })
  }
  
  closeEditModal()
}

function closeEditModal() {
  showEditModal.value = false
  editingItem.value = null
}

function handleModeChange(value: boolean) {
  useCustomMode.value = value
  if (value && props.customData.length === 0) {
    // 切换到自定义数据，复制默认数据
    emit('update:customData', [...props.defaultData])
  }
  if (!props.disableJsonEditor) {
    updateJsonFromData()
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
      useCustomMode.value = false
      // 如果当前是编辑器视图，更新 JSON 内容
      if (!props.disableJsonEditor && activeView.value === 'editor') {
        jsonContent.value = JSON.stringify(props.defaultData, null, 2)
      }
      if (!props.disableJsonEditor) {
        updateJsonFromData()
      }
      showSuccess({
        title: '重置成功',
        message: '已恢复为默认数据'
      })
    }
  })
}

function handleClearAll() {
  showConfirm({
    title: '确认清理',
    message: '确定要清理全部数据吗？此操作将删除所有数据（包括默认数据），且不可恢复。',
    confirmText: '清理',
    cancelText: '取消'
  }).then((confirmed) => {
    if (confirmed) {
      emit('update:customData', [])
      if (!props.disableJsonEditor) {
        jsonContent.value = '[]'
        syncStatus.value = 'synced'
        setTimeout(() => {
          syncStatus.value = null
        }, 2000)
      }
      showSuccess({
        title: '清理成功',
        message: '已清理全部数据'
      })
    }
  })
}

// 监听 JSON 内容变化（仅在启用 JSON 编辑器时）
watch(() => jsonContent.value, () => {
  // JSON 编辑器会自动触发验证
}, { enabled: () => !props.disableJsonEditor })
</script>

<style scoped>
.data-manager {
  @apply w-full;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
