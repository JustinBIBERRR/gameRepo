<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <router-view />
    <GlobalModal />
    <GlobalLoading />
  </div>
</template>

<script setup lang="ts">
import GlobalModal from './components/GlobalModal.vue'
import GlobalLoading from './components/GlobalLoading.vue'
</script>
