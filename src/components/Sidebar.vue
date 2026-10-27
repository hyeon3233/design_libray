<script setup>
import logoImg from '../assets/logo.png'
</script>


<template>
  <aside class="sidebar">
      <div class="brand">
  <img :src="logoImg" alt="Cherry Design Archive" class="brand-logo" />
</div>

    <nav class="side-nav">
  <RouterLink to="/">⌂　홈</RouterLink>
  <RouterLink to="/favorites">☆　즐겨찾기</RouterLink>
  <RouterLink to="/projects">▱　프로젝트</RouterLink>
  <RouterLink to="/categories">◇　카테고리</RouterLink>
  

  <div class="menu-divider"></div>

  <RouterLink to="/trash">♧　휴지통</RouterLink>
</nav>
  </aside>
</template>

<style scoped>
.menu-divider {
  display: block;
  width: 233px;
  height: 1px;
  min-height: 1px;
  background: #dedee2;
  margin: 8px 0;
  flex-shrink: 0;
}

.brand {
  margin-bottom: 45px;
}

.brand-logo {
  width: 207px;
  height: 48px;
  display: block;
  margin: 0 auto;
}
</style>