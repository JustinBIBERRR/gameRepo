<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="handleBackdropClick"
      >
        <!-- 背景遮罩 -->
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"></div>
        
        <!-- 模态框容器 -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div
            class="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all"
            @click.stop
          >
            <!-- 内容区域 -->
            <div class="p-6 md:p-8">
              <!-- 图标 -->
              <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full mb-4"
                :class="iconBgClass">
                <component :is="iconComponent" class="h-6 w-6" :class="iconClass" />
              </div>
              
              <!-- 标题 -->
              <h3 class="text-center text-xl font-semibold text-gray-900 mb-2">
                {{ title }}
              </h3>
              
              <!-- 内容 -->
              <div class="text-center text-gray-600 mb-6">
                <p>{{ message }}</p>
              </div>
              
              <!-- 按钮组 -->
              <div class="flex gap-3">
                <button
                  v-if="showCancel"
                  @click="handleCancel"
                  class="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 min-h-[44px]"
                >
                  {{ cancelText }}
                </button>
                <button
                  @click="handleConfirm"
                  class="flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[44px]"
                  :class="confirmButtonClass"
                >
                  {{ confirmText }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: boolean
  title: string
  message: string
  type?: 'confirm' | 'alert' | 'success' | 'warning' | 'danger'
  showCancel?: boolean
  confirmText?: string
  cancelText?: string
  closeOnBackdrop?: boolean
}>(), {
  type: 'confirm',
  showCancel: true,
  confirmText: '确定',
  cancelText: '取消',
  closeOnBackdrop: true
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
  'cancel': []
}>()

const iconComponent = computed(() => {
  const icons = {
    confirm: () => h('svg', {
      class: 'h-6 w-6',
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
      })
    ]),
    alert: () => h('svg', {
      class: 'h-6 w-6',
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
      })
    ]),
    success: () => h('svg', {
      class: 'h-6 w-6',
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
      })
    ]),
    warning: () => h('svg', {
      class: 'h-6 w-6',
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
      })
    ]),
    danger: () => h('svg', {
      class: 'h-6 w-6',
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
      })
    ])
  }
  return icons[props.type] || icons.confirm
})

const iconBgClass = computed(() => {
  const classes = {
    confirm: 'bg-blue-100',
    alert: 'bg-blue-100',
    success: 'bg-green-100',
    warning: 'bg-yellow-100',
    danger: 'bg-red-100'
  }
  return classes[props.type] || classes.confirm
})

const iconClass = computed(() => {
  const classes = {
    confirm: 'text-blue-600',
    alert: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600'
  }
  return classes[props.type] || classes.confirm
})

const confirmButtonClass = computed(() => {
  const classes = {
    confirm: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500',
    alert: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500',
    success: 'bg-green-600 hover:bg-green-700 active:bg-green-800 focus:ring-green-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800 focus:ring-yellow-500',
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 focus:ring-red-500'
  }
  return classes[props.type] || classes.confirm
})

function handleConfirm() {
  emit('confirm')
  emit('update:modelValue', false)
}

function handleCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}

function handleBackdropClick() {
  if (props.closeOnBackdrop) {
    emit('update:modelValue', false)
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .transform,
.modal-leave-active .transform {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-enter-from .transform,
.modal-leave-to .transform {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}
</style>
