import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import ProjectsView from '../views/ProjectsView.vue'
import CategoriesView from '../views/CategoriesView.vue'
import FavoritesView from '../views/FavoritesView.vue'
import TrashView from '../views/TrashView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/projects', component: ProjectsView },
  { path: '/categories', component: CategoriesView },
  { path: '/favorites', component: FavoritesView },
  { path: '/trash', component: TrashView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router