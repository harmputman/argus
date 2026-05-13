import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'browse',
    component: () => import('../views/BrowseView.vue'),
  },
  {
    path: '/detail/:mediaType/:id',
    name: 'detail',
    component: () => import('../views/DetailView.vue'),
    props: true,
  },
  {
    path: '/watchlist',
    name: 'watchlist',
    component: () => import('../views/WatchlistView.vue'),
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../views/SettingsView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
