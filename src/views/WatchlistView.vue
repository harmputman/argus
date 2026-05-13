<template>
  <div class="px-4 py-4">
    <h1 class="text-xl font-bold mb-4 text-ctp-text inline-flex items-center gap-2">
      <Bookmark :size="22" /> My List
    </h1>

    <!-- Tabs -->
    <div class="flex gap-1 mb-4 border-b border-ctp-surface1">
      <button
        class="px-4 py-2 text-sm font-medium transition inline-flex items-center gap-2 border-b-2 -mb-px"
        :class="activeTab === 'watchlist'
          ? 'border-ctp-maroon text-ctp-maroon'
          : 'border-transparent text-ctp-subtext0 hover:text-ctp-text'"
        @click="activeTab = 'watchlist'"
      >
        <BookmarkCheck :size="14" />
        Watchlist
        <span v-if="watchlist.watchlistItems.length" class="text-xs bg-ctp-surface2 rounded-full px-1.5 py-0.5">
          {{ watchlist.watchlistItems.length }}
        </span>
      </button>
      <button
        class="px-4 py-2 text-sm font-medium transition inline-flex items-center gap-2 border-b-2 -mb-px"
        :class="activeTab === 'watched'
          ? 'border-ctp-green text-ctp-green'
          : 'border-transparent text-ctp-subtext0 hover:text-ctp-text'"
        @click="activeTab = 'watched'"
      >
        <Eye :size="14" />
        Watched
        <span v-if="watchlist.watchedItems.length" class="text-xs bg-ctp-surface2 rounded-full px-1.5 py-0.5">
          {{ watchlist.watchedItems.length }}
        </span>
      </button>
    </div>

    <!-- Watchlist tab -->
    <template v-if="activeTab === 'watchlist'">
      <div v-if="watchlist.watchlistItems.length === 0" class="flex flex-col items-center py-16 text-ctp-subtext0">
        <BookmarkX :size="48" class="mb-3 text-ctp-overlay0" />
        <p class="text-lg mb-2">Your watchlist is empty</p>
        <router-link to="/" class="text-ctp-accent underline inline-flex items-center gap-1">
          <Compass :size="14" /> Discover movies and TV shows
        </router-link>
      </div>
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <MediaCard
          v-for="item in watchlist.watchlistItems"
          :key="item.id"
          :item="item"
          :media-type="item.media_type"
        />
      </div>
    </template>

    <!-- Watched tab -->
    <template v-if="activeTab === 'watched'">
      <div v-if="watchlist.watchedItems.length === 0" class="flex flex-col items-center py-16 text-ctp-subtext0">
        <EyeOff :size="48" class="mb-3 text-ctp-overlay0" />
        <p class="text-lg mb-2">You haven't marked anything as watched yet</p>
        <router-link to="/" class="text-ctp-accent underline inline-flex items-center gap-1">
          <Compass :size="14" /> Discover movies and TV shows
        </router-link>
      </div>
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <MediaCard
          v-for="item in watchlist.watchedItems"
          :key="item.id"
          :item="item"
          :media-type="item.media_type"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Bookmark, BookmarkCheck, BookmarkX, Eye, EyeOff, Compass } from 'lucide-vue-next'
import { useWatchlistStore } from '../stores/watchlist'
import MediaCard from '../components/MediaCard.vue'

const watchlist = useWatchlistStore()
const activeTab = ref('watchlist')
</script>
