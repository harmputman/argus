<template>
  <div :class="[settings.theme === 'light' ? 'light' : '', 'min-h-dvh flex flex-col bg-ctp-base text-ctp-text']">
    <main class="flex-1 pb-20">
      <router-view />
    </main>
    <NavBar />
  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue'
import { useSettingsStore } from './stores/settings'

const settings = useSettingsStore()
</script>
