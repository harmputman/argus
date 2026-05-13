import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const WATCHLIST_KEY = 'argus_watchlist'
const WATCHED_KEY = 'argus_watched'

function loadFromStorage(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const useWatchlistStore = defineStore('watchlist', () => {
  const watchlistItems = ref(loadFromStorage(WATCHLIST_KEY))
  const watchedItems = ref(loadFromStorage(WATCHED_KEY))

  watch(watchlistItems, (val) => localStorage.setItem(WATCHLIST_KEY, JSON.stringify(val)), { deep: true })
  watch(watchedItems, (val) => localStorage.setItem(WATCHED_KEY, JSON.stringify(val)), { deep: true })

  // Legacy alias
  const items = watchlistItems

  function isOnWatchlist(id) {
    return watchlistItems.value.some((item) => item.id === id)
  }

  function isWatched(id) {
    return watchedItems.value.some((item) => item.id === id)
  }

  function _buildItem({ id, title, poster_path, media_type, vote_average, release_date }) {
    return { id, title, poster_path, media_type, vote_average, release_date }
  }

  function addToWatchlist(item) {
    if (!isOnWatchlist(item.id)) {
      watchlistItems.value.push(_buildItem(item))
    }
  }

  function removeFromWatchlist(id) {
    watchlistItems.value = watchlistItems.value.filter((item) => item.id !== id)
  }

  function toggleWatchlist(item) {
    if (isOnWatchlist(item.id)) {
      removeFromWatchlist(item.id)
    } else {
      addToWatchlist(item)
    }
  }

  function addToWatched(item) {
    if (!isWatched(item.id)) {
      watchedItems.value.push(_buildItem(item))
    }
    // Verwijder van watchlist als het daar op staat
    removeFromWatchlist(item.id)
  }

  function removeFromWatched(id) {
    watchedItems.value = watchedItems.value.filter((item) => item.id !== id)
  }

  function toggleWatched(item) {
    if (isWatched(item.id)) {
      removeFromWatched(item.id)
    } else {
      addToWatched(item)
    }
  }

  // Legacy compat
  const add = addToWatchlist
  const remove = removeFromWatchlist
  const toggle = toggleWatchlist

  return {
    items, watchlistItems, watchedItems,
    isOnWatchlist, isWatched,
    addToWatchlist, removeFromWatchlist, toggleWatchlist,
    addToWatched, removeFromWatched, toggleWatched,
    add, remove, toggle,
  }
})
