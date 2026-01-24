<template>
  <Modal
    v-model="modalState.visible"
    :title="modalState.options?.title || ''"
    :message="modalState.options?.message || ''"
    :type="modalState.options?.type || 'confirm'"
    :show-cancel="modalState.options?.showCancel ?? true"
    :confirm-text="modalState.options?.confirmText"
    :cancel-text="modalState.options?.cancelText"
    :close-on-backdrop="modalState.options?.closeOnBackdrop ?? true"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />
</template>

<script setup lang="ts">
import { modalState, handleConfirm, handleCancel } from '../composables/useModal'
import Modal from './Modal.vue'
</script>
