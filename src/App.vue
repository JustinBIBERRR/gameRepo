<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <router-view />
    <GlobalModal />
    <GlobalLoading />
    <!-- useModal 确认对话框 -->
    <Modal
      v-if="modalState.visible && modalState.options"
      v-model="modalState.visible"
      :title="modalState.options.title"
      :message="modalState.options.message"
      :type="modalState.options.type || 'confirm'"
      :show-cancel="modalState.options.showCancel !== false"
      :confirm-text="modalState.options.confirmText || '确定'"
      :cancel-text="modalState.options.cancelText || '取消'"
      :close-on-backdrop="modalState.options.closeOnBackdrop !== false"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import GlobalModal from './components/GlobalModal.vue'
import GlobalLoading from './components/GlobalLoading.vue'
import Modal from './components/Modal.vue'
import { modalState, handleConfirm, handleCancel } from './composables/useModal'
</script>
