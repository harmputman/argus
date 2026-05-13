<template>
  <aside
    class="absolute top-0 left-0 bottom-0 w-64 bg-ctp-mantle flex flex-col"
  >
    <div class="flex items-center justify-between px-4 py-3 border-b border-ctp-surface0">
      <h2 class="text-sm font-semibold text-ctp-text flex items-center gap-2">
        <SlidersHorizontal :size="16" />
        Filters
      </h2>
      <button
        class="text-ctp-subtext0 hover:text-ctp-text transition p-1"
        @click="$emit('close')"
      >
        <X :size="18" />
      </button>
    </div>

    <div class="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      <!-- Type -->
      <label class="flex flex-col text-xs text-ctp-subtext0">
        Type
        <select v-model="type" class="mt-1 bg-ctp-surface0 text-ctp-text rounded px-2 py-1.5 text-sm border border-ctp-surface2 focus:border-ctp-accent focus:outline-none">
          <option value="all">Movies &amp; TV Shows</option>
          <option value="movie">Movies</option>
          <option value="tv">TV Shows</option>
        </select>
      </label>

      <!-- Genre -->
      <label class="flex flex-col text-xs text-ctp-subtext0">
        Genre
        <select v-model="genre" class="mt-1 bg-ctp-surface0 text-ctp-text rounded px-2 py-1.5 text-sm border border-ctp-surface2 focus:border-ctp-accent focus:outline-none">
          <option value="">All</option>
          <option v-for="g in genres" :key="g.id" :value="g.id">{{ g.name }}</option>
        </select>
      </label>

      <!-- Language -->
      <label class="flex flex-col text-xs text-ctp-subtext0">
        Language
        <select v-model="language" class="mt-1 bg-ctp-surface0 text-ctp-text rounded px-2 py-1.5 text-sm border border-ctp-surface2 focus:border-ctp-accent focus:outline-none">
          <option value="">All</option>
          <option v-for="l in languages" :key="l.iso_639_1" :value="l.iso_639_1">
            {{ l.english_name }}
          </option>
        </select>
      </label>

      <!-- Min rating -->
      <label class="flex flex-col text-xs text-ctp-subtext0">
        Min. Rating
        <select v-model.number="minRating" class="mt-1 bg-ctp-surface0 text-ctp-text rounded px-2 py-1.5 text-sm border border-ctp-surface2 focus:border-ctp-accent focus:outline-none">
          <option :value="0">All</option>
          <option v-for="n in [5, 6, 7, 8]" :key="n" :value="n">&ge; {{ n }}</option>
        </select>
      </label>

      <!-- Sort -->
      <label class="flex flex-col text-xs text-ctp-subtext0">
        Sort By
        <select v-model="sortBy" class="mt-1 bg-ctp-surface0 text-ctp-text rounded px-2 py-1.5 text-sm border border-ctp-surface2 focus:border-ctp-accent focus:outline-none">
          <option value="popularity.desc">Most Popular</option>
          <option value="popularity.asc">Least Popular</option>
          <option value="vote_average.desc">Highest Rated</option>
          <option value="vote_average.asc">Lowest Rated</option>
          <option value="primary_release_date.desc">Newest</option>
          <option value="primary_release_date.asc">Oldest</option>
          <option value="title.asc">A-Z</option>
          <option value="title.desc">Z-A</option>
        </select>
      </label>
    </div>
  </aside>
</template>

<script setup>
import { SlidersHorizontal, X } from 'lucide-vue-next'

const type = defineModel('type', { default: 'movie' })
const genre = defineModel('genre', { default: '' })
const language = defineModel('language', { default: '' })
const minRating = defineModel('minRating', { default: 0 })
const sortBy = defineModel('sortBy', { default: 'popularity.desc' })

defineProps({
  genres: { type: Array, default: () => [] },
  languages: { type: Array, default: () => [] },
})

defineEmits(['close'])
</script>
