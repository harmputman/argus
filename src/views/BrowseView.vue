<template>
  <div class="relative overflow-x-hidden">
    <!-- Filter panel: always present, fixed behind the content -->
    <FilterBar
      v-model:type="settings.browseMediaType"
      v-model:genre="settings.browseGenre"
      v-model:language="settings.browseLanguage"
      v-model:min-rating="settings.browseMinRating"
      v-model:sort-by="settings.browseSortBy"
      :open="filtersOpen"
      :genres="genres"
      :languages="languages"
      @close="filtersOpen = false"
    />

    <!-- Main content: slides right to reveal filters -->
    <div
      class="relative z-10 bg-ctp-base transition-transform duration-300 ease-in-out min-h-dvh"
      :class="filtersOpen ? 'translate-x-64' : ''"
    >
      <!-- Overlay to close panel (on top of content) -->
      <div
        v-if="filtersOpen"
        class="absolute inset-0 z-40 bg-ctp-crust/50"
        @click="filtersOpen = false"
      />

      <!-- Floating filter tab on the left edge -->
      <button
        v-if="!filtersOpen"
        class="fixed left-0 top-1/2 -translate-y-1/2 z-30 bg-ctp-surface0 hover:bg-ctp-surface1 border border-l-0 border-ctp-surface2 rounded-r-lg px-1.5 py-3 transition flex flex-col items-center gap-1.5 shadow-lg"
        @click="filtersOpen = true"
      >
        <SlidersHorizontal :size="16" class="text-ctp-subtext0" />
      </button>

      <!-- Warning when no providers are selected -->
      <div v-if="!hasProviders" class="flex flex-col items-center px-4 py-16 text-ctp-subtext0">
        <TvMinimal :size="48" class="mb-3 text-ctp-overlay0" />
        <p class="text-lg mb-2">No streaming services selected</p>
        <router-link to="/settings" class="text-ctp-accent underline inline-flex items-center gap-1">
          <SettingsIcon :size="14" /> Go to Settings to choose your services
        </router-link>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="flex flex-col items-center px-4 py-16 text-ctp-red">
        <AlertCircle :size="48" class="mb-3" />
        <p>{{ error }}</p>
        <button class="mt-2 text-ctp-accent underline" @click="loadResults">Retry</button>
      </div>

      <!-- Grid -->
      <div v-else class="px-4 py-4">
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <MediaCard
            v-for="item in filteredResults"
            :key="item.id"
            :item="item"
            :media-type="item.media_type || settings.browseMediaType"
          />
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex flex-col items-center py-8 text-ctp-subtext0">
          <LoaderCircle :size="28" class="animate-spin mb-1" />
          <span>Loading...</span>
        </div>

        <!-- No results -->
        <div v-else-if="filteredResults.length === 0" class="flex flex-col items-center py-16 text-ctp-subtext0">
          <SearchX :size="48" class="mb-3 text-ctp-overlay0" />
          <span>No results found.</span>
        </div>

        <!-- Load more -->
        <div v-else-if="page < totalPages" class="text-center py-6">
          <button
            class="bg-ctp-accent hover:bg-ctp-yellow text-ctp-base px-6 py-2 rounded-lg font-semibold transition inline-flex items-center gap-2"
            @click="loadMore"
          >
            <ChevronDown :size="16" />
            Load More
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import {
  TvMinimal, Settings as SettingsIcon, AlertCircle, LoaderCircle, SearchX, ChevronDown, SlidersHorizontal,
} from 'lucide-vue-next'
import { useSettingsStore } from '../stores/settings'
import { useWatchlistStore } from '../stores/watchlist'
import { useTmdb } from '../composables/useTmdb'
import FilterBar from '../components/FilterBar.vue'
import MediaCard from '../components/MediaCard.vue'

const settings = useSettingsStore()
const watchlistStore = useWatchlistStore()
const { discover, getGenres, getLanguages } = useTmdb()

const results = ref([])
const page = ref(1)
const totalPages = ref(1)
const loading = ref(false)
const error = ref(null)
const genres = ref([])
const languages = ref([])
const filtersOpen = ref(false)

const hasProviders = computed(() => settings.selectedProviders.length > 0)

const filteredResults = computed(() => {
  if (!settings.hideWatched) return results.value
  return results.value.filter((item) => !watchlistStore.isWatched(item.id))
})

const mediaTypes = computed(() =>
  settings.browseMediaType === 'all' ? ['movie', 'tv'] : [settings.browseMediaType],
)

/**
 * TMDB uses different genre IDs for movies and TV.
 * Some TV genres bundle two movie genres:
 *   TV 10759 "Action & Adventure" ≈ Movie 28 "Action" + 12 "Adventure"
 *   TV 10765 "Sci-Fi & Fantasy"   ≈ Movie 878 "Science Fiction" + 14 "Fantasy"
 *   TV 10768 "War & Politics"     ≈ Movie 10752 "War" + (no direct equivalent)
 *
 * genreGroupMap: TV genre ID → array of equivalent movie genre IDs
 * movieToTvGenre: movie genre ID → TV genre ID (reverse lookup)
 */
const genreGroupMap = {
  10759: [28, 12],    // Action & Adventure → Action, Adventure
  10765: [878, 14],   // Sci-Fi & Fantasy → Science Fiction, Fantasy
  10768: [10752],     // War & Politics → War
}
const movieToTvGenre = {}
for (const [tvId, movieIds] of Object.entries(genreGroupMap)) {
  for (const mid of movieIds) {
    movieToTvGenre[mid] = Number(tvId)
  }
}
// Set of TV genre IDs that are merged (to filter from the list)
const mergedTvGenreIds = new Set(Object.keys(genreGroupMap).map(Number))

async function loadGenres() {
  try {
    if (settings.browseMediaType === 'all') {
      const [movieGenres, tvGenres] = await Promise.all([
        getGenres('movie'),
        getGenres('tv'),
      ])
      // Take all movie genres + TV genres that have no merged equivalent
      const map = new Map()
      movieGenres.forEach((g) => map.set(g.id, g))
      tvGenres
        .filter((g) => !mergedTvGenreIds.has(g.id))
        .forEach((g) => { if (!map.has(g.id)) map.set(g.id, g) })
      genres.value = Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
    } else {
      genres.value = await getGenres(settings.browseMediaType)
    }
  } catch {
    genres.value = []
  }
}

/**
 * Returns the correct genre ID for a specific media type.
 * In "all" mode a movie genre ID is stored; for the TV call
 * we translate it to the equivalent TV genre ID.
 */
function genreForType(type) {
  const selected = settings.browseGenre
  if (!selected) return undefined
  const id = Number(selected)
  if (type === 'tv' && movieToTvGenre[id]) {
    return movieToTvGenre[id]
  }
  return id
}

function buildParams(type, pageNum) {
  return {
    region: settings.region,
    providers: settings.selectedProviders,
    genre: genreForType(type),
    language: settings.browseLanguage,
    minRating: settings.browseMinRating,
    sortBy: settings.browseSortBy,
    page: pageNum,
  }
}

/**
 * In "all" mode, two parallel discover calls are made (movie + tv).
 * Results are merged and each item gets a media_type so the
 * MediaCard links correctly to the detail page.
 */
async function discoverAll(pageNum) {
  const types = mediaTypes.value
  const responses = await Promise.all(
    types.map((type) => discover(type, buildParams(type, pageNum))),
  )

  // Tag each item with media_type
  const tagged = responses.flatMap((data, i) =>
    data.results.map((item) => ({ ...item, media_type: types[i] })),
  )

  // In "all" mode: sort the merged results client-side
  if (types.length > 1) {
    const sortKey = settings.browseSortBy
    tagged.sort((a, b) => {
      if (sortKey === 'popularity.desc') return b.popularity - a.popularity
      if (sortKey === 'popularity.asc') return a.popularity - b.popularity
      if (sortKey === 'vote_average.desc') return b.vote_average - a.vote_average
      if (sortKey === 'vote_average.asc') return a.vote_average - b.vote_average
      if (sortKey === 'primary_release_date.desc')
        return (b.release_date || b.first_air_date || '').localeCompare(a.release_date || a.first_air_date || '')
      if (sortKey === 'primary_release_date.asc')
        return (a.release_date || a.first_air_date || '').localeCompare(b.release_date || b.first_air_date || '')
      if (sortKey === 'title.asc')
        return (a.title || a.name || '').localeCompare(b.title || b.name || '')
      if (sortKey === 'title.desc')
        return (b.title || b.name || '').localeCompare(a.title || a.name || '')
      return 0
    })
  }

  // total_pages is the minimum of both (we paginate synchronously)
  const tp = Math.min(...responses.map((d) => d.total_pages))
  return { results: tagged, total_pages: tp }
}

const MIN_VISIBLE = 20

async function loadResults() {
  if (!hasProviders.value) return
  loading.value = true
  error.value = null
  try {
    const data = await discoverAll(1)
    results.value = data.results
    page.value = 1
    totalPages.value = data.total_pages
    // Load extra pages if too many items are filtered out
    await fillIfNeeded()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  loading.value = true
  try {
    const data = await discoverAll(page.value + 1)
    results.value.push(...data.results)
    page.value++
    totalPages.value = data.total_pages
    await fillIfNeeded()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

/**
 * Automatically load extra pages when filtering on watched items
 * leaves too few visible results.
 */
async function fillIfNeeded() {
  if (!settings.hideWatched) return
  while (filteredResults.value.length < MIN_VISIBLE && page.value < totalPages.value) {
    const data = await discoverAll(page.value + 1)
    results.value.push(...data.results)
    page.value++
    totalPages.value = data.total_pages
  }
}

// Reload when filters change
watch(
  () => [settings.browseMediaType, settings.browseGenre, settings.browseLanguage, settings.browseMinRating, settings.browseSortBy],
  loadResults,
)

// Reload genres when type changes
watch(() => settings.browseMediaType, (_, old) => {
  if (old !== undefined) settings.browseGenre = ''
  loadGenres()
}, { immediate: true })

// Load languages once
getLanguages().then((data) => (languages.value = data)).catch(() => {})

// Initial load
loadResults()
</script>
