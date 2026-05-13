<template>
  <span class="inline-flex items-center gap-1 flex-wrap">
    <span
      v-for="code in countryCodes"
      :key="code"
      class="fi inline-block"
      :class="`fi-${code}`"
      :title="code.toUpperCase()"
    />
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** A single ISO 639-1 language code, or an array of language codes or spoken_languages objects */
  languages: { type: [String, Array], default: () => [] },
})

/**
 * Mapping of English language names (as returned by OMDb) to ISO 639-1 codes.
 */
const nameToIso = {
  arabic: 'ar', bengali: 'bn', cantonese: 'zh', chinese: 'zh', croatian: 'hr',
  czech: 'cs', danish: 'da', dutch: 'nl', english: 'en', estonian: 'et',
  filipino: 'tl', finnish: 'fi', french: 'fr', german: 'de', greek: 'el',
  hebrew: 'he', hindi: 'hi', hungarian: 'hu', icelandic: 'is', indonesian: 'id',
  irish: 'ga', italian: 'it', japanese: 'ja', kannada: 'kn', korean: 'ko',
  latvian: 'lv', lithuanian: 'lt', malay: 'ms', malayalam: 'ml', mandarin: 'zh',
  marathi: 'mr', nepali: 'ne', norwegian: 'no', pashto: 'ps', persian: 'fa',
  polish: 'pl', portuguese: 'pt', punjabi: 'pa', romanian: 'ro', russian: 'ru',
  serbian: 'sr', sign: null, sinhalese: 'si', sinhala: 'si', slovak: 'sk',
  slovenian: 'sl', spanish: 'es', swedish: 'sv', tagalog: 'tl', tamil: 'ta',
  telugu: 'te', thai: 'th', turkish: 'tr', ukrainian: 'uk', urdu: 'ur',
  vietnamese: 'vi', welsh: 'cy', zulu: 'zu', afrikaans: 'af', albanian: 'sq',
  armenian: 'hy', azerbaijani: 'az', basque: 'eu', bosnian: 'bs', bulgarian: 'bg',
  burmese: 'my', catalan: 'ca', flemish: 'nl', galician: 'gl', georgian: 'ka',
  gujarati: 'gu', khmer: 'km', lao: 'lo', macedonian: 'mk', maltese: 'mt',
  mongolian: 'mn', none: null, swahili: 'sw', uzbek: 'uz', yoruba: 'yo',
}

/**
 * Mapping of ISO 639-1 language codes to ISO 3166-1 country codes for flags.
 * Languages that don't map 1:1 to a country get the most commonly used flag.
 */
const langToCountry = {
  en: 'gb',
  ja: 'jp',
  ko: 'kr',
  zh: 'cn',
  hi: 'in',
  ar: 'sa',
  fa: 'ir',
  he: 'il',
  uk: 'ua',
  cs: 'cz',
  da: 'dk',
  sv: 'se',
  nb: 'no',
  nn: 'no',
  el: 'gr',
  et: 'ee',
  ka: 'ge',
  sl: 'si',
  sq: 'al',
  ms: 'my',
  vi: 'vn',
  tl: 'ph',
  ta: 'lk',
  te: 'in',
  bn: 'bd',
  ur: 'pk',
  pa: 'in',
  gu: 'in',
  kn: 'in',
  ml: 'in',
  mr: 'in',
  si: 'lk',
  km: 'kh',
  lo: 'la',
  my: 'mm',
  ne: 'np',
  cy: 'gb-wls',
  ga: 'ie',
  eu: 'es',
  ca: 'es-ct',
  gl: 'es-ga',
}

function toCountryCode(lang) {
  if (!lang) return null
  const lower = lang.toLowerCase().trim()
  // Try as English language name first (OMDb format)
  if (lower.length > 3) {
    const iso = nameToIso[lower]
    if (iso === null) return null // explicitly excluded (e.g. "Sign", "None")
    if (iso) {
      const code = iso.split('-')[0]
      return langToCountry[code] || code
    }
  }
  // Otherwise treat as ISO 639-1 code
  const code = lower.split('-')[0]
  return langToCountry[code] || code
}

const countryCodes = computed(() => {
  const input = props.languages
  if (!input) return []
  if (typeof input === 'string') {
    const cc = toCountryCode(input)
    return cc ? [cc] : []
  }
  // Array of strings or { iso_639_1 } objects
  const codes = input
    .map((l) => (typeof l === 'string' ? l : l?.iso_639_1))
    .map(toCountryCode)
    .filter(Boolean)
  // Deduplicate
  return [...new Set(codes)]
})
</script>
