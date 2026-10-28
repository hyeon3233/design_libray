<script setup>
import logoImg from '../assets/logo.png'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const isProjectActive = computed(() => {
  return route.path === '/projects' || route.path.startsWith('/folders/')
})
</script>


<template>
  <aside class="sidebar">
      <div class="brand">
  <img :src="logoImg" alt="Cherry Design Archive" class="brand-logo" />
</div>

    <nav class="side-nav">
  <RouterLink to="/">⌂　홈</RouterLink>
  <RouterLink to="/favorites">☆　즐겨찾기</RouterLink>
  <RouterLink
  to="/projects"
  :class="{ 'router-link-active': isProjectActive }"
>
  ▱　모든 폴더
</RouterLink>
  <RouterLink to="/categories">◇　카테고리</RouterLink>
  

  <div class="menu-divider"></div>

  <RouterLink to="/trash">♧　휴지통</RouterLink>
</nav>
  </aside>
</template>

<style scoped>
.menu-divider {
  display: block;
  width: 100%;
  height: 1px;
  min-height: 1px;
  background: #dedee2;
  margin: 8px 0;
  flex-shrink: 0;
}

.brand {
  margin-bottom: 20px;
}

.brand-logo {
  width: 150px;
  height: auto;
  display: block;
  margin: 0 auto;
  object-fit: contain;
}
</style>