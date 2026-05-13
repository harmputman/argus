<template>
  <div
    class="aspect-[2/3] [perspective:800px] cursor-pointer"
    @click="flip"
  >
    <div
      class="relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d]"
      :class="{ '[transform:rotateY(180deg)]': flipped }"
    >
      <!-- Front: poster + badges -->
      <div class="absolute inset-0 rounded-lg overflow-hidden bg-ctp-surface1 [backface-visibility:hidden]">
        <img
          v-if="item.poster_path"
          :src="`https://image.tmdb.org/t/p/w342${item.poster_path}`"
          :alt="title"
          class="w-full h-full object-cover"
          loading="lazy"
        />
        <div v-else class="w-full h-full flex items-center justify-center text-ctp-overlay0 text-sm">
          No poster
        </div>
        <div class="absolute top-2 left-2 flex items-center gap-1">
          <span
            class="bg-black/60 text-white/80 rounded p-1"
            :title="resolvedType === 'tv' ? 'TV Show' : 'Movie'"
          >
            <Tv v-if="resolvedType === 'tv'" :size="12" />
            <Clapperboard v-else :size="12" />
          </span>
          <span v-if="onWatchlist" class="bg-black/60 text-ctp-maroon rounded p-1">
            <BookmarkCheck :size="12" />
          </span>
          <span v-if="isWatched" class="bg-black/60 text-ctp-green rounded p-1">
            <Eye :size="12" />
          </span>
        </div>
        <span
          v-if="item.vote_average"
          class="absolute top-2 right-2 bg-black/60 text-ctp-yellow text-xs font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-0.5"
        >
          <Star :size="10" />
          {{ item.vote_average.toFixed(1) }}
        </span>
      </div>

      <!-- Back: info + actions -->
      <div class="absolute inset-0 rounded-lg overflow-hidden bg-ctp-surface0 [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-between p-4">
        <div class="space-y-2">
          <div class="flex items-center gap-2 text-xs text-ctp-subtext0">
            <Tv v-if="resolvedType === 'tv'" :size="12" />
            <Clapperboard v-else :size="12" />
            <span>{{ resolvedType === 'tv' ? 'TV Show' : 'Movie' }}</span>
          </div>
          <h3 class="text-sm font-semibold text-ctp-text leading-tight line-clamp-3">{{ title }}</h3>
          <div class="flex items-center gap-2 text-xs text-ctp-subtext0">
            <span v-if="releaseYear">{{ releaseYear }}</span>
            <LanguageFlags v-if="item.original_language" :languages="item.original_language" />
          </div>
          <!-- Streaming providers -->
          <div v-if="providers.length" class="flex flex-wrap gap-1 pt-1">
            <img
              v-for="p in providers"
              :key="p.provider_id"
              :src="`https://image.tmdb.org/t/p/w45${p.logo_path}`"
              :alt="p.provider_name"
              :title="p.provider_name"
              class="w-6 h-6 rounded"
            />
          </div>
          <div v-else-if="loadingProviders" class="text-xs text-ctp-overlay1">
            <LoaderCircle :size="12" class="animate-spin inline" /> Loading...
          </div>
        </div>
        <div class="flex flex-col gap-2 mt-3">
          <div class="flex gap-2">
            <button
              class="flex-1 flex items-center justify-center gap-2 rounded px-3 py-2 text-sm font-medium transition"
              :class="onWatchlist
                ? 'bg-ctp-maroon text-ctp-crust hover:bg-ctp-maroon/80'
                : 'bg-ctp-surface2 text-ctp-text hover:bg-ctp-overlay0'"
              :title="onWatchlist ? 'Remove from watchlist' : 'Add to watchlist'"
              @click.stop="handleToggleWatchlist"
            >
              <BookmarkCheck v-if="onWatchlist" :size="18" />
              <BookmarkPlus v-else :size="18" />
            </button>
            <button
              class="flex-1 flex items-center justify-center gap-2 rounded px-3 py-2 text-sm font-medium transition"
              :class="isWatched
                ? 'bg-ctp-green text-ctp-crust hover:bg-ctp-green/80'
                : 'bg-ctp-surface2 text-ctp-text hover:bg-ctp-overlay0'"
              :title="isWatched ? 'Mark as not watched' : 'Mark as watched'"
              @click.stop="handleToggleWatched"
            >
              <Eye v-if="isWatched" :size="18" />
              <EyeOff v-else :size="18" />
            </button>
          </div>
          <router-link
            :to="{ name: 'detail', params: { mediaType: resolvedType, id: item.id } }"
            class="w-full flex items-center justify-center gap-2 rounded px-3 py-2 text-sm font-medium bg-ctp-surface2 text-ctp-text hover:bg-ctp-overlay0 transition"
            @click.stop
          >
            <Info :size="16" />
            Details
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Star, Tv, Clapperboard, BookmarkPlus, BookmarkCheck, Eye, EyeOff, Info, LoaderCircle } from 'lucide-vue-next'
import LanguageFlags from './LanguageFlags.vue'
import { useWatchlistStore } from '../stores/watchlist'
import { useSettingsStore } from '../stores/settings'
import { useTmdb } from '../composables/useTmdb'

const props = defineProps({
  item: { type: Object, required: true },
  mediaType: { type: String, default: 'movie' },
})

const watchlist = useWatchlistStore()
const settings = useSettingsStore()
const { getItemProviders } = useTmdb()

const flipped = ref(false)
const providers = ref([])
const loadingProviders = ref(false)
const providersLoaded = ref(false)

const title = computed(() => props.item.title || props.item.name || 'Unknown')
const resolvedType = computed(() => props.item.media_type || props.mediaType)
const releaseYear = computed(() => {
  const date = props.item.release_date || props.item.first_air_date
  return date ? date.substring(0, 4) : ''
})
const onWatchlist = computed(() => watchlist.isOnWatchlist(props.item.id))
const isWatched = computed(() => watchlist.isWatched(props.item.id))

function flip() {
  flipped.value = !flipped.value
  if (flipped.value && !providersLoaded.value) {
    loadProviders()
  }
}

async function loadProviders() {
  loadingProviders.value = true
  try {
    providers.value = await getItemProviders(resolvedType.value, props.item.id, settings.region)
    // Filter to selected providers
    if (settings.selectedProviders.length) {
      providers.value = providers.value.filter((p) =>
        settings.selectedProviders.includes(p.provider_id),
      )
    }
  } catch {
    providers.value = []
  } finally {
    loadingProviders.value = false
    providersLoaded.value = true
  }
}

function itemData() {
  return {
    id: props.item.id,
    title: title.value,
    poster_path: props.item.poster_path,
    media_type: resolvedType.value,
    vote_average: props.item.vote_average,
    release_date: props.item.release_date || props.item.first_air_date,
  }
}

function handleToggleWatchlist() {
  watchlist.toggleWatchlist(itemData())
}

function handleToggleWatched() {
  watchlist.toggleWatched(itemData())
}
</script>
