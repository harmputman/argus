<template>
  <nav class="fixed bottom-0 inset-x-0 z-50 bg-ctp-mantle border-t border-ctp-surface0">
    <div class="flex justify-around items-center h-16 max-w-lg mx-auto">
      <router-link
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="flex flex-col items-center gap-0.5 text-xs transition-colors"
        :class="$route.name === link.name ? 'text-ctp-accent' : 'text-ctp-overlay1 hover:text-ctp-text'"
      >
        <component :is="link.icon" :size="22" :stroke-width="1.75" />
        <span>{{ link.label }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { Compass, Bookmark, Settings } from 'lucide-vue-next'

const links = [
  { to: '/', name: 'browse', label: 'Discover', icon: Compass },
  { to: '/watchlist', name: 'watchlist', label: 'My List', icon: Bookmark },
  { to: '/settings', name: 'settings', label: 'Settings', icon: Settings },
]
</script>
