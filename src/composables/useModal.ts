
interface ModalOptions {
  title: string
  message: string
  type?: 'confirm' | 'alert' | 'success' | 'warning' | 'danger'
  showCancel?: boolean
  confirmText?: string
  cancelText?: string
  closeOnBackdrop?: boolean
}

// 全局单例状态
const modalState = ref<{
  visible: boolean
  options: ModalOptions | null
  resolve: ((value: boolean) => void) | null
}>({
  visible: false,
  options: null,
  resolve: null
})

function showModal(options: ModalOptions): Promise<boolean> {
  return new Promise((resolve) => {
    modalState.value = {
      visible: true,
      options,
      resolve
    }
  })
}

function confirm(options: Omit<ModalOptions, 'type'>): Promise<boolean> {
  return showModal({ ...options, type: 'confirm' })
}

function alert(options: Omit<ModalOptions, 'type' | 'showCancel'>): Promise<void> {
  return new Promise((resolve) => {
    showModal({ ...options, type: 'alert', showCancel: false }).then(() => {
      resolve()
    })
  })
}

function success(options: Omit<ModalOptions, 'type' | 'showCancel'>): Promise<void> {
  return new Promise((resolve) => {
    showModal({ ...options, type: 'success', showCancel: false }).then(() => {
      resolve()
    })
  })
}

function error(options: Omit<ModalOptions, 'type' | 'showCancel'>): Promise<void> {
  return new Promise((resolve) => {
    showModal({ ...options, type: 'danger', showCancel: false }).then(() => {
      resolve()
    })
  })
}

function handleConfirm() {
  if (modalState.value.resolve) {
    modalState.value.resolve(true)
  }
  modalState.value.visible = false
}

function handleCancel() {
  if (modalState.value.resolve) {
    modalState.value.resolve(false)
  }
  modalState.value.visible = false
}

function close() {
  if (modalState.value.resolve) {
    modalState.value.resolve(false)
  }
  modalState.value.visible = false
}

// 导出单例函数和状态
export function useModal() {
  return {
    modalState,
    showModal,
    confirm,
    alert,
    success,
    error,
    handleConfirm,
    handleCancel,
    close
  }
}

// 导出全局状态和处理器（供 GlobalModal 使用）
export { modalState, handleConfirm, handleCancel }
