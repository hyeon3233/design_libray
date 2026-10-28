import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import AllFoldersView from '../views/AllFoldersView.vue'
import CategoriesView from '../views/CategoriesView.vue'
import FavoritesView from '../views/FavoritesView.vue'
import TrashView from '../views/TrashView.vue'
import FolderView from '../views/FolderView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/allfolders', component: AllFoldersView },
  { path: '/categories', component: CategoriesView },
  { path: '/favorites', component: FavoritesView },
  { path: '/trash', component: TrashView },
  { path: '/folders/:id', component: FolderView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router