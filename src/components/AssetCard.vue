
<script setup>
import { computed } from 'vue'

import {
  isFavorite,
  toggleFavorite
} from '../stores/favorites'

import favoriteOff from '../assets/icon/Favorit_off.svg'
import favoriteOn from '../assets/icon/Favorit_on.svg'

const props = defineProps({
  file: {
    type: Object,
    required: true
  },
  title: String,
  thumbnail: String,
  tags: {
    type: Array,
    default: () => []
  },
  updatedAt: String,
  author: {
    type: String,
    default: '나'
  }
})

// 파일의 즐겨찾기 식별자
const favoriteFolderId = computed(() =>
  props.file.folderId ?? 'home'
)

// 현재 즐겨찾기 상태
const isFileFavorite = computed(() =>
  isFavorite(
    favoriteFolderId.value,
    props.file.id
  )
)

// 즐겨찾기 추가 / 해제
function handleFavorite() {
  toggleFavorite(props.file, {
    id: favoriteFolderId.value,
    name: '홈 파일'
  })
}
</script>

<template>
  <article class="asset-card">

    <!-- 파일 썸네일 -->
    <div class="asset-thumbnail">
      <img
        v-if="thumbnail"
        :src="thumbnail"
        :alt="title"
      />
      <span v-else>이미지 미리보기</span>
    </div>

    <!-- 파일 이름 -->
    <div class="asset-title">
      <h3>{{ title }}</h3>

      <button type="button" class="more-btn">
        ⋯
      </button>
    </div>

    <!-- 태그 -->
    <div class="asset-tags">
      <span
        v-for="tag in tags"
        :key="tag"
        class="asset-tag"
      >
        {{ tag }}
      </span>
    </div>

    <!-- 작성자 / 날짜 / 즐겨찾기 -->
    <div class="asset-bottom">

      <div class="author">
        <span class="avatar">C</span>
        <span>{{ author }}</span>
      </div>

      <div class="asset-actions">
        <span>{{ updatedAt }}</span>

        <!-- 파일 즐겨찾기 -->
        <button
          type="button"
          class="favorite-btn"
          :aria-label="
            isFileFavorite
              ? '즐겨찾기 해제'
              : '즐겨찾기 추가'
          "
          :aria-pressed="isFileFavorite"
          @click.stop="handleFavorite"
        >
          <img
            :src="
              isFileFavorite
                ? favoriteOn
                : favoriteOff
            "
            alt=""
          />
        </button>
      </div>

    </div>

  </article>
</template>

<style scoped>
.asset-card {
  min-width: 0;
  background: #fff;
}

.asset-thumbnail {
  width: 100%;
  aspect-ratio: 1.7 / 1;
  background: #f2f3f7;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca6ba;
  font-size: 12px;
}

.asset-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.asset-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 9px;
}

.asset-title h3 {
  min-width: 0;
  font-size: 14px;
  font-weight: 700;
  color: #18243c;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.more-btn {
  border: none;
  background: none;
  color: #8494b2;
  font-size: 20px;
  cursor: pointer;
}

.asset-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 7px;
}

.asset-tag {
  background: #f2f4f8;
  color: #7182a1;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 11px;
}

.asset-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  color: #8491a8;
  font-size: 12px;
}

.author {
  display: flex;
  align-items: center;
  gap: 6px;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #8b46d8;
  color: white;
  font-size: 10px;
  font-weight: 700;
}

/* 날짜 및 즐겨찾기 */
.asset-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.favorite-btn {
  width: 26px;
  height: 26px;
  padding: 3px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
}

.favorite-btn img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}
</style>
