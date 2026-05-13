<template>
  <div class="px-4 py-4 max-w-lg mx-auto">
    <h1 class="text-xl font-bold mb-6 text-ctp-text inline-flex items-center gap-2">
      <SettingsIcon :size="22" /> Settings
    </h1>

    <!-- Theme -->
    <div class="mb-6">
      <h2 class="text-sm text-ctp-subtext0 mb-2 inline-flex items-center gap-1">
        <Sun :size="14" /> Theme
      </h2>
      <div class="flex gap-2">
        <button
          v-for="opt in themeOptions"
          :key="opt.value"
          class="flex items-center gap-2 px-4 py-2 rounded border text-sm transition"
          :class="settings.theme === opt.value
            ? 'border-ctp-accent bg-ctp-accent/15 text-ctp-accent'
            : 'border-ctp-surface2 text-ctp-subtext0 hover:border-ctp-accent'"
          @click="settings.theme = opt.value"
        >
          <component :is="opt.icon" :size="14" />
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- Hide watched items -->
    <label class="flex items-center gap-3 mb-6 cursor-pointer">
      <input
        v-model="settings.hideWatched"
        type="checkbox"
        class="accent-ctp-accent w-4 h-4"
      />
      <span class="text-sm text-ctp-text inline-flex items-center gap-1">
        <EyeOff :size="14" class="text-ctp-subtext0" />
        Hide watched movies and TV shows from Discover
      </span>
    </label>

    <!-- Region -->
    <label class="block mb-6">
      <span class="text-sm text-ctp-subtext0 inline-flex items-center gap-1">
        <Globe :size="14" /> Region
      </span>
      <select
        :value="settings.region"
        class="mt-1 w-full bg-ctp-surface0 text-ctp-text rounded px-3 py-2 border border-ctp-surface2 focus:border-ctp-accent focus:outline-none"
        @change="settings.setRegion(($event.target).value)"
      >
        <option v-for="r in regions" :key="r.code" :value="r.code">
          {{ r.label }}
        </option>
      </select>
    </label>

    <!-- Preferred languages -->
    <div class="mb-6">
      <h2 class="text-sm text-ctp-subtext0 mb-1 inline-flex items-center gap-1">
        <LanguagesIcon :size="14" /> Preferred Languages
      </h2>
      <p class="text-xs text-ctp-overlay1 mb-2">
        Select which languages to show on detail pages. If none are selected, all languages are shown.
      </p>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <label
          v-for="lang in availableLanguages"
          :key="lang.code"
          class="flex items-center gap-2 p-2 rounded hover:bg-ctp-surface0 cursor-pointer transition"
        >
          <input
            type="checkbox"
            :checked="settings.preferredLanguages.includes(lang.code)"
            class="accent-ctp-accent w-4 h-4"
            @change="settings.toggleLanguage(lang.code)"
          />
          <span class="fi inline-block" :class="`fi-${lang.flag}`" />
          <span class="text-sm text-ctp-text">{{ lang.label }}</span>
        </label>
      </div>
    </div>

    <!-- Streaming services -->
    <div>
      <h2 class="text-sm text-ctp-subtext0 mb-2 inline-flex items-center gap-1">
        <Tv :size="14" /> Streaming Services
      </h2>

      <div v-if="loadingProviders" class="flex items-center gap-2 text-ctp-subtext0 text-sm">
        <LoaderCircle :size="16" class="animate-spin" /> Loading...
      </div>
      <div v-else-if="providerError" class="text-ctp-red text-sm inline-flex items-center gap-1">
        <AlertCircle :size="14" />
        {{ providerError }}
        <button class="text-ctp-accent underline ml-2" @click="loadProviders">Retry</button>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
        <label
          v-for="p in providers"
          :key="p.provider_id"
          class="flex items-center gap-3 p-2 rounded hover:bg-ctp-surface0 cursor-pointer transition"
        >
          <input
            type="checkbox"
            :checked="settings.selectedProviders.includes(p.provider_id)"
            class="accent-ctp-accent w-4 h-4"
            @change="settings.toggleProvider(p.provider_id)"
          />
          <img
            v-if="p.logo_path"
            :src="`https://image.tmdb.org/t/p/w92${p.logo_path}`"
            :alt="p.provider_name"
            class="w-8 h-8 rounded"
          />
          <span class="text-sm text-ctp-text">{{ p.provider_name }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { Settings as SettingsIcon, Globe, Tv, Languages as LanguagesIcon, LoaderCircle, AlertCircle, Sun, Moon, EyeOff } from 'lucide-vue-next'
import { useSettingsStore } from '../stores/settings'
import { useTmdb } from '../composables/useTmdb'

const settings = useSettingsStore()
const { getWatchProviders } = useTmdb()

const regions = [
  { code: 'NL', label: 'Netherlands' },
  { code: 'BE', label: 'Belgium' },
  { code: 'DE', label: 'Germany' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'US', label: 'United States' },
  { code: 'FR', label: 'France' },
]

const availableLanguages = [
  { code: 'nl', flag: 'nl', label: 'Dutch' },
  { code: 'en', flag: 'gb', label: 'English' },
  { code: 'de', flag: 'de', label: 'German' },
  { code: 'fr', flag: 'fr', label: 'French' },
  { code: 'es', flag: 'es', label: 'Spanish' },
  { code: 'it', flag: 'it', label: 'Italian' },
  { code: 'pt', flag: 'pt', label: 'Portuguese' },
  { code: 'ja', flag: 'jp', label: 'Japanese' },
  { code: 'ko', flag: 'kr', label: 'Korean' },
  { code: 'zh', flag: 'cn', label: 'Chinese' },
  { code: 'hi', flag: 'in', label: 'Hindi' },
  { code: 'ar', flag: 'sa', label: 'Arabic' },
  { code: 'ru', flag: 'ru', label: 'Russian' },
  { code: 'pl', flag: 'pl', label: 'Polish' },
  { code: 'tr', flag: 'tr', label: 'Turkish' },
  { code: 'sv', flag: 'se', label: 'Swedish' },
  { code: 'da', flag: 'dk', label: 'Danish' },
  { code: 'no', flag: 'no', label: 'Norwegian' },
  { code: 'fi', flag: 'fi', label: 'Finnish' },
  { code: 'cs', flag: 'cz', label: 'Czech' },
  { code: 'hu', flag: 'hu', label: 'Hungarian' },
  { code: 'th', flag: 'th', label: 'Thai' },
]

const themeOptions = [
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'light', label: 'Light', icon: Sun },
]

const providers = ref([])
const loadingProviders = ref(false)
const providerError = ref(null)

async function loadProviders() {
  loadingProviders.value = true
  providerError.value = null
  try {
    providers.value = await getWatchProviders(settings.region)
  } catch (e) {
    providerError.value = e.message
  } finally {
    loadingProviders.value = false
  }
}

watch(() => settings.region, loadProviders)
onMounted(loadProviders)
</script>
