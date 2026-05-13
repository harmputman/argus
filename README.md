# Argus

**One Watchlist to Rule Them All**

A streaming discovery PWA that helps you browse movies and TV shows across your streaming services. Find what to watch, track your watchlist, and mark what you've seen — all in one place.

## Features

- Browse movies and TV shows available on your selected streaming services
- Filter by type, genre, language, rating, and sort order
- Flip-card UI with poster, ratings, and provider icons
- Watchlist and Watched tracking (stored locally)
- Detail pages with trailers, ratings (TMDB, IMDb, Rotten Tomatoes), cast, and spoken languages
- Dark (Mocha) and Light (Latte) themes using the Catppuccin palette
- Installable as a PWA

## Tech Stack

- **Vue 3** (Composition API, `<script setup>`)
- **Vite** with PWA plugin
- **Tailwind CSS v4** with Catppuccin color tokens
- **Pinia** for state management
- **Vue Router** for navigation
- **Lucide Icons** for iconography
- **flag-icons** for language flags

## APIs

- [TMDB API v3](https://developer.themoviedb.org/docs) — movie/TV data, streaming providers, genres
- [OMDb API](https://www.omdbapi.com/) — IMDb and Rotten Tomatoes ratings

## Getting Started

```bash
# Install dependencies
npm install

# Copy .env.example and add your API keys
cp .env.example .env

# Start dev server
npm run dev

# Build for production
npm run build
```

## Environment Variables

See `.env.example` for required variables:

| Variable | Description |
|---|---|
| `VITE_TMDB_API_KEY` | Your TMDB v3 API key |
| `VITE_OMDB_API_KEY` | Your OMDb API key |

## Data Storage

All user data (watchlist, watched items, settings, filter preferences) is stored in `localStorage`. There is no backend or user account system.
