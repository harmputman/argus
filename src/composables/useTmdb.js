/**
 * Composable voor alle TMDB & OMDb API calls.
 *
 * TMDB wordt gebruikt voor discover, providers, genres, details en trailers.
 * OMDb wordt gebruikt voor IMDb- en Rotten Tomatoes-scores op de detailpagina.
 *
 * NB: Voor het filteren op "minimale beoordeling" in de browse-view gebruiken
 * we de native vote_average van TMDB. OMDb zou te veel API-calls vereisen om
 * vooraf voor de hele grid in te laden.
 */

const TMDB_BASE = 'https://api.themoviedb.org/3'
const OMDB_BASE = 'https://www.omdbapi.com'

function getTmdbApiKey() {
  const key = import.meta.env.VITE_TMDB_API_KEY
  if (!key) throw new Error('VITE_TMDB_API_KEY is niet ingesteld in .env')
  return key
}

async function tmdb(path, params = {}) {
  const url = new URL(`${TMDB_BASE}${path}`)
  url.searchParams.set('api_key', getTmdbApiKey())
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v)
  })
  const res = await fetch(url)
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${res.statusText}`)
  return res.json()
}

async function omdb(imdbId) {
  const key = import.meta.env.VITE_OMDB_API_KEY
  if (!key || !imdbId) return null
  try {
    const res = await fetch(`${OMDB_BASE}/?i=${imdbId}&apikey=${key}`)
    if (!res.ok) return null
    const data = await res.json()
    if (data.Response === 'False') return null
    return data
  } catch {
    return null
  }
}

export function useTmdb() {
  async function getWatchProviders(region) {
    const [movie, tv] = await Promise.all([
      tmdb('/watch/providers/movie', { watch_region: region }),
      tmdb('/watch/providers/tv', { watch_region: region }),
    ])
    // Merge en deduplicate providers
    const map = new Map()
    ;[...movie.results, ...tv.results].forEach((p) => map.set(p.provider_id, p))
    return Array.from(map.values()).sort((a, b) => a.display_priority - b.display_priority)
  }

  async function getGenres(mediaType = 'movie') {
    const data = await tmdb(`/genre/${mediaType}/list`, { language: 'nl-NL' })
    return data.genres
  }

  async function getLanguages() {
    const data = await tmdb('/configuration/languages')
    return data
      .filter((l) => l.iso_639_1 && l.english_name)
      .sort((a, b) => (a.english_name || '').localeCompare(b.english_name || ''))
  }

  async function discover(mediaType, { region, providers, genre, language, minRating, sortBy, page = 1 }) {
    return tmdb(`/discover/${mediaType}`, {
      watch_region: region,
      with_watch_providers: providers?.join('|'),
      with_watch_monetization_types: 'flatrate|free|ads',
      with_genres: genre || undefined,
      with_original_language: language || undefined,
      'vote_average.gte': minRating || undefined,
      sort_by: sortBy || 'popularity.desc',
      page,
      language: 'nl-NL',
    })
  }

  async function getDetail(mediaType, id) {
    const data = await tmdb(`/${mediaType}/${id}`, {
      language: 'nl-NL',
      append_to_response: 'videos,credits,external_ids,translations,watch/providers',
    })
    return data
  }

  async function getOmdbRatings(imdbId) {
    const data = await omdb(imdbId)
    if (!data) return null
    const rt = data.Ratings?.find((r) => r.Source === 'Rotten Tomatoes')
    return {
      imdbRating: data.imdbRating,
      rottenTomatoes: rt?.Value ?? null,
      languages: data.Language || null,
    }
  }

  async function getItemProviders(mediaType, id, region) {
    const data = await tmdb(`/${mediaType}/${id}/watch/providers`)
    const countryData = data.results?.[region]
    if (!countryData) return []
    // Combineer flatrate, free en ads providers, deduplicate
    const map = new Map()
    ;[...(countryData.flatrate || []), ...(countryData.free || []), ...(countryData.ads || [])]
      .forEach((p) => map.set(p.provider_id, p))
    return Array.from(map.values())
  }

  return { getWatchProviders, getLanguages, getGenres, discover, getDetail, getItemProviders, getOmdbRatings }
}
