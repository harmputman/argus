import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'argus_settings'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useSettingsStore = defineStore('settings', () => {
  const saved = loadFromStorage()

  const region = ref(saved?.region ?? 'NL')
  const selectedProviders = ref(saved?.selectedProviders ?? [])
  const preferredLanguages = ref(saved?.preferredLanguages ?? [])
  const theme = ref(saved?.theme ?? 'dark')
  const hideWatched = ref(saved?.hideWatched ?? false)

  // Browse filters
  const browseMediaType = ref(saved?.browseMediaType ?? 'movie')
  const browseGenre = ref(saved?.browseGenre ?? '')
  const browseLanguage = ref(saved?.browseLanguage ?? '')
  const browseMinRating = ref(saved?.browseMinRating ?? 0)
  const browseSortBy = ref(saved?.browseSortBy ?? 'popularity.desc')

  function persist() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        region: region.value,
        selectedProviders: selectedProviders.value,
        preferredLanguages: preferredLanguages.value,
        theme: theme.value,
        hideWatched: hideWatched.value,
        browseMediaType: browseMediaType.value,
        browseGenre: browseGenre.value,
        browseLanguage: browseLanguage.value,
        browseMinRating: browseMinRating.value,
        browseSortBy: browseSortBy.value,
      }),
    )
  }

  watch(region, persist)
  watch(selectedProviders, persist, { deep: true })
  watch(preferredLanguages, persist, { deep: true })
  watch(theme, persist)
  watch(hideWatched, persist)
  watch([browseMediaType, browseGenre, browseLanguage, browseMinRating, browseSortBy], persist)

  function setRegion(code) {
    region.value = code
  }

  function toggleProvider(id) {
    const idx = selectedProviders.value.indexOf(id)
    if (idx === -1) {
      selectedProviders.value.push(id)
    } else {
      selectedProviders.value.splice(idx, 1)
    }
  }

  function toggleLanguage(code) {
    const idx = preferredLanguages.value.indexOf(code)
    if (idx === -1) {
      preferredLanguages.value.push(code)
    } else {
      preferredLanguages.value.splice(idx, 1)
    }
  }

  return {
    region, selectedProviders, preferredLanguages, theme, hideWatched,
    browseMediaType, browseGenre, browseLanguage, browseMinRating, browseSortBy,
    setRegion, toggleProvider, toggleLanguage,
  }
})
