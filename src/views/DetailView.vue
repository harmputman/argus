<template>
  <div v-if="loading" class="flex flex-col items-center py-16 text-ctp-subtext0">
    <LoaderCircle :size="32" class="animate-spin mb-2" />
    <span>Loading...</span>
  </div>

  <div v-else-if="error" class="flex flex-col items-center py-16 text-ctp-red">
    <AlertCircle :size="32" class="mb-2" />
    <p>{{ error }}</p>
    <button class="mt-2 text-ctp-accent underline" @click="load">Retry</button>
  </div>

  <div v-else-if="detail" class="pb-8">
    <!-- Back button -->
    <button
      class="sticky top-0 z-40 flex items-center gap-1 px-4 py-2 text-sm text-ctp-subtext1 hover:text-ctp-text bg-ctp-base/80 backdrop-blur transition w-full"
      @click="goBack"
    >
      <ArrowLeft :size="16" /> Back
    </button>

    <!-- Trailer or backdrop -->
    <div class="aspect-video bg-ctp-crust">
      <iframe
        v-if="trailerKey"
        :src="`https://www.youtube.com/embed/${trailerKey}`"
        class="w-full h-full"
        allowfullscreen
        frameborder="0"
      />
      <img
        v-else-if="detail.backdrop_path"
        :src="`https://image.tmdb.org/t/p/w1280${detail.backdrop_path}`"
        :alt="title"
        class="w-full h-full object-cover"
      />
    </div>

    <div class="px-4 mt-4 space-y-4">
      <!-- Title -->
      <h1 class="text-2xl font-bold text-ctp-text">{{ title }}</h1>

      <!-- Ratings -->
      <div class="flex items-center gap-4 text-sm">
        <span class="text-ctp-yellow font-bold inline-flex items-center gap-1">
          <Star :size="14" /> {{ detail.vote_average?.toFixed(1) }}
        </span>
        <span v-if="ratings?.imdbRating" class="font-bold text-ctp-peach inline-flex items-center gap-1">
          <Film :size="14" /> {{ ratings.imdbRating }}
        </span>
        <span v-if="ratings?.rottenTomatoes" class="font-bold text-ctp-red inline-flex items-center gap-1">
          <Cherry :size="14" /> {{ ratings.rottenTomatoes }}
        </span>
      </div>

      <!-- Meta -->
      <div class="flex flex-wrap items-center gap-3 text-sm text-ctp-subtext0">
        <span v-if="releaseDate" class="inline-flex items-center gap-1">
          <Calendar :size="14" /> {{ releaseDate }}
        </span>
        <span v-if="runtime" class="inline-flex items-center gap-1">
          <Clock :size="14" /> {{ runtime }}
        </span>
        <span v-if="detail.genres?.length" class="inline-flex items-center gap-1">
          <Tag :size="14" /> {{ detail.genres.map((g) => g.name).join(', ') }}
        </span>
      </div>

      <!-- Spoken languages (TMDB spoken_languages + OMDb Language merged) -->
      <div v-if="spokenLanguages.length" class="flex items-center gap-2 text-sm text-ctp-subtext0">
        <Languages :size="14" />
        <span>Languages:</span>
        <LanguageFlags :languages="spokenLanguages" />
      </div>

      <!-- Streaming providers -->
      <div v-if="watchProviders.length" class="flex items-center gap-2">
        <span class="text-sm text-ctp-subtext0">Available on:</span>
        <div class="flex gap-1.5">
          <img
            v-for="p in watchProviders"
            :key="p.provider_id"
            :src="`https://image.tmdb.org/t/p/w45${p.logo_path}`"
            :alt="p.provider_name"
            :title="p.provider_name"
            class="w-7 h-7 rounded"
          />
        </div>
      </div>

      <!-- Watchlist & Watched buttons -->
      <div class="flex gap-3">
        <button
          class="flex-1 py-3 rounded-lg font-semibold transition text-base inline-flex items-center justify-center gap-2"
          :class="onWatchlist
            ? 'bg-ctp-maroon text-ctp-crust hover:bg-ctp-maroon/80'
            : 'bg-ctp-surface1 text-ctp-text hover:bg-ctp-surface2'"
          @click="handleToggleWatchlist"
        >
          <BookmarkCheck v-if="onWatchlist" :size="18" />
          <BookmarkPlus v-else :size="18" />
          {{ onWatchlist ? 'On Watchlist' : 'Watchlist' }}
        </button>
        <button
          class="flex-1 py-3 rounded-lg font-semibold transition text-base inline-flex items-center justify-center gap-2"
          :class="isWatched
            ? 'bg-ctp-green text-ctp-crust hover:bg-ctp-green/80'
            : 'bg-ctp-surface1 text-ctp-text hover:bg-ctp-surface2'"
          @click="handleToggleWatched"
        >
          <Eye v-if="isWatched" :size="18" />
          <EyeOff v-else :size="18" />
          {{ isWatched ? 'Watched' : 'Not Watched' }}
        </button>
      </div>

      <!-- Description -->
      <p class="text-ctp-subtext1 leading-relaxed">{{ detail.overview || 'No description available.' }}</p>

      <!-- Cast -->
      <div v-if="cast.length">
        <h2 class="text-lg font-semibold mb-2 text-ctp-text inline-flex items-center gap-2">
          <Users :size="18" /> Cast
        </h2>
        <div class="flex gap-3 overflow-x-auto pb-2">
          <div
            v-for="person in cast"
            :key="person.id"
            class="flex-shrink-0 w-20 text-center"
          >
            <div class="w-20 h-20 rounded-full bg-ctp-surface1 overflow-hidden mx-auto">
              <img
                v-if="person.profile_path"
                :src="`https://image.tmdb.org/t/p/w185${person.profile_path}`"
                :alt="person.name"
                class="w-full h-full object-cover"
              />
            </div>
            <p class="text-xs mt-1 truncate text-ctp-text">{{ person.name }}</p>
            <p class="text-xs text-ctp-overlay1 truncate">{{ person.character }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft, LoaderCircle, AlertCircle, Star, Film, Cherry,
  Calendar, Clock, Tag, Languages, BookmarkPlus, BookmarkCheck, Eye, EyeOff, Users,
} from 'lucide-vue-next'
import { useTmdb } from '../composables/useTmdb'
import { useWatchlistStore } from '../stores/watchlist'
import { useSettingsStore } from '../stores/settings'
import LanguageFlags from '../components/LanguageFlags.vue'

const props = defineProps({
  mediaType: { type: String, required: true },
  id: { type: [String, Number], required: true },
})

const router = useRouter()
const { getDetail, getOmdbRatings } = useTmdb()
const watchlist = useWatchlistStore()
const settings = useSettingsStore()

const detail = ref(null)
const ratings = ref(null)
const loading = ref(true)
const error = ref(null)

const title = computed(() => detail.value?.title || detail.value?.name || '')
const releaseDate = computed(() => detail.value?.release_date || detail.value?.first_air_date || '')
const runtime = computed(() => {
  const m = detail.value?.runtime || detail.value?.episode_run_time?.[0]
  return m ? `${m} min` : ''
})

const trailerKey = computed(() => {
  const videos = detail.value?.videos?.results || []
  const trailer = videos.find((v) => v.type === 'Trailer' && v.site === 'YouTube')
    || videos.find((v) => v.site === 'YouTube')
  return trailer?.key
})

const cast = computed(() => (detail.value?.credits?.cast || []).slice(0, 10))

/**
 * Mapping of English language names (OMDb) to ISO 639-1 codes.
 */
const langNameToIso = {
  arabic: 'ar', bengali: 'bn', cantonese: 'zh', chinese: 'zh', croatian: 'hr',
  czech: 'cs', danish: 'da', dutch: 'nl', english: 'en', estonian: 'et',
  filipino: 'tl', finnish: 'fi', french: 'fr', german: 'de', greek: 'el',
  hebrew: 'he', hindi: 'hi', hungarian: 'hu', icelandic: 'is', indonesian: 'id',
  italian: 'it', japanese: 'ja', korean: 'ko', mandarin: 'zh', norwegian: 'no',
  persian: 'fa', polish: 'pl', portuguese: 'pt', romanian: 'ro', russian: 'ru',
  spanish: 'es', swedish: 'sv', thai: 'th', turkish: 'tr', ukrainian: 'uk',
  vietnamese: 'vi',
}

/**
 * Merge languages from three sources and filter by user preferences:
 * 1. TMDB spoken_languages (ISO codes)
 * 2. TMDB translations (ISO codes, broadest source)
 * 3. OMDb Language (English names, often more complete than spoken_languages)
 *
 * If the user has set preferred languages, only show those.
 * Otherwise show all available languages.
 */
const spokenLanguages = computed(() => {
  // 1. TMDB spoken_languages
  const tmdbSpoken = (detail.value?.spoken_languages || [])
    .map((l) => l.iso_639_1)
    .filter(Boolean)

  // 2. TMDB translations
  const tmdbTranslations = (detail.value?.translations?.translations || [])
    .map((t) => t.iso_639_1)
    .filter(Boolean)

  // 3. OMDb Language
  const omdbLangs = ratings.value?.languages
    ? ratings.value.languages.split(',')
        .map((s) => langNameToIso[s.trim().toLowerCase()])
        .filter(Boolean)
    : []

  // Merge and deduplicate as ISO codes
  const allCodes = [...new Set([...tmdbSpoken, ...omdbLangs, ...tmdbTranslations])]

  // Filter by user preferences (if set)
  const preferred = settings.preferredLanguages
  if (preferred.length > 0) {
    return allCodes.filter((code) => preferred.includes(code))
  }
  return allCodes
})

const onWatchlist = computed(() => watchlist.isOnWatchlist(Number(props.id)))
const isWatched = computed(() => watchlist.isWatched(Number(props.id)))

const watchProviders = computed(() => {
  const regionData = detail.value?.['watch/providers']?.results?.[settings.region]
  if (!regionData) return []
  const map = new Map()
  ;[...(regionData.flatrate || []), ...(regionData.free || []), ...(regionData.ads || [])]
    .forEach((p) => map.set(p.provider_id, p))
  // Filter to selected providers if any
  let result = Array.from(map.values())
  if (settings.selectedProviders.length) {
    result = result.filter((p) => settings.selectedProviders.includes(p.provider_id))
  }
  return result
})

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

function _itemData() {
  return {
    id: detail.value.id,
    title: title.value,
    poster_path: detail.value.poster_path,
    media_type: props.mediaType,
    vote_average: detail.value.vote_average,
    release_date: releaseDate.value,
  }
}

function handleToggleWatchlist() {
  watchlist.toggleWatchlist(_itemData())
}

function handleToggleWatched() {
  watchlist.toggleWatched(_itemData())
}

async function load() {
  loading.value = true
  error.value = null
  try {
    const data = await getDetail(props.mediaType, props.id)
    detail.value = data

    // Fetch OMDb ratings via imdb_id (in parallel)
    const imdbId = data.imdb_id || data.external_ids?.imdb_id
    if (imdbId) {
      getOmdbRatings(imdbId).then((r) => (ratings.value = r))
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
