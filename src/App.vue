<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <router-view />
    <GlobalLoading />
    <PartyFloatingWidget />
    <!-- useModal 确认对话框 -->
    <Modal
      v-if="modalState.visible && modalState.options"
      v-model="modalState.visible"
      :title="modalState.options.title"
      :message="modalState.options.message"
      :type="modalState.options.type || 'confirm'"
      :show-cancel="modalState.options.showCancel !== false"
      :confirm-text="modalState.options.confirmText || t('common.confirm')"
      :cancel-text="modalState.options.cancelText || t('common.cancel')"
      :close-on-backdrop="modalState.options.closeOnBackdrop !== false"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import GlobalLoading from './components/GlobalLoading.vue'
import Modal from './components/Modal.vue'
import PartyFloatingWidget from './components/PartyFloatingWidget.vue'
import { modalState, handleConfirm, handleCancel } from './composables/useModal'
import { startMovieIdlePreload } from './utils/movieIdlePreload'

const { t } = useI18n()

onMounted(() => {
  startMovieIdlePreload()
})
</script>
