
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import logoImg from '../assets/logo.png'

// 피그마 SVG 아이콘 - 기본 상태
import homeOff from '../assets/icon/Home_off.svg'
import favoriteOff from '../assets/icon/Favorit_off.svg'
import folderOff from '../assets/icon/Folder_off.svg'
import categoryOff from '../assets/icon/Categori_off.svg'
import trashOff from '../assets/icon/Trash_off.svg'

// 피그마 SVG 아이콘 - 선택 상태
import homeOn from '../assets/icon/Home_on.svg'
import favoriteOn from '../assets/icon/Favorit_on.svg'
import folderOn from '../assets/icon/Folder_on.svg'
import categoryOn from '../assets/icon/Categori_on.svg'
import trashOn from '../assets/icon/Trash_on.svg'

const route = useRoute()

// 현재 페이지 확인
const isHomeActive = computed(() => route.path === '/')

const isFavoriteActive = computed(() =>
  route.path.startsWith('/favorites')
)

const isProjectActive = computed(() =>
  route.path === '/projects' || route.path.startsWith('/folders/')
)

const isCategoryActive = computed(() =>
  route.path.startsWith('/categories')
)

const isTrashActive = computed(() =>
  route.path.startsWith('/trash')
)
</script>

<template>
  <aside class="sidebar">

    <!-- 로고 -->
    <div class="brand">
      <img
        :src="logoImg"
        alt="Cherry Design Archive"
        class="brand-logo"
      />
    </div>

    <!-- 사이드바 메뉴 -->
    <nav class="side-nav">

      <!-- 홈 -->
      <RouterLink to="/">
        <img
          :src="isHomeActive ? homeOn : homeOff"
          class="nav-icon"
          alt=""
        />
        <span>홈</span>
      </RouterLink>

      <!-- 즐겨찾기 -->
      <RouterLink to="/favorites">
        <img
          :src="isFavoriteActive ? favoriteOn : favoriteOff"
          class="nav-icon"
          alt=""
        />
        <span>즐겨찾기</span>
      </RouterLink>

      <!-- 모든 폴더 -->
      <RouterLink
        to="/projects"
        :class="{ 'router-link-active': isProjectActive }"
      >
        <img
          :src="isProjectActive ? folderOn : folderOff"
          class="nav-icon"
          alt=""
        />
        <span>모든 폴더</span>
      </RouterLink>

      <!-- 카테고리 -->
      <RouterLink to="/categories">
        <img
          :src="isCategoryActive ? categoryOn : categoryOff"
          class="nav-icon"
          alt=""
        />
        <span>카테고리</span>
      </RouterLink>

      <!-- 구분선 -->
      <div class="menu-divider"></div>

      <!-- 휴지통 -->
      <RouterLink to="/trash">
        <img
          :src="isTrashActive ? trashOn : trashOff"
          class="nav-icon"
          alt=""
        />
        <span>휴지통</span>
      </RouterLink>

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

/* 로고 */
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

/* 사이드바 아이콘 및 텍스트 정렬 */
.side-nav a {
  display: flex;
  align-items: center;
  gap: 14px;
}

/* 피그마 SVG 아이콘 */
.nav-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  flex-shrink: 0;
  background: transparent;
}
</style>
