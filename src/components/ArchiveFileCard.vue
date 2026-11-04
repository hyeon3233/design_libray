

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { folderList } from '../stores/folders'
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
  }
})

const router = useRouter()

// 파일이 속한 폴더 찾기
const folder = computed(() =>
  folderList.value.find(
    item => String(item.id) === String(props.file.folderId)
  )
)

// 폴더가 없는 홈 파일도 즐겨찾기가 가능하도록 설정
const favoriteFolder = computed(() =>
  folder.value ?? {
    id: 'home',
    name: '홈 파일'
  }
)

// 파일 즐겨찾기 여부
const isFileFavorite = computed(() =>
  isFavorite(
    favoriteFolder.value.id,
    props.file.id
  )
)

// 즐겨찾기 추가 / 해제
function handleFavorite() {
  toggleFavorite(
    props.file,
    favoriteFolder.value
  )
}

// 파일 클릭 시 해당 폴더로 이동
function openFileFolder() {
  if (folder.value) {
    router.push(`/folders/${folder.value.id}`)
  }
}
</script>

<template>
  <article
    class="file-card"
    :class="{ clickable: folder }"
    @click="openFileFolder"
  >
    <!-- 파일 썸네일 -->
    <div
      class="file-thumbnail"
      :style="{
        backgroundColor: file.color || '#f5e9f0'
      }"
    >
      <img
        v-if="file.thumbnail"
        :src="file.thumbnail"
        :alt="file.name"
        class="preview-image"
      />

      <div v-else class="thumbnail-design">
        <span class="thumbnail-cherry">● ●</span>
        <span class="thumbnail-title">CHERRY</span>
        <span class="thumbnail-caption">
          DESIGN ARCHIVE
        </span>
      </div>

      <!-- 파일 확장자 -->
      <span class="file-extension">
        {{ file.type }}
      </span>
    </div>

    <!-- 파일 정보 -->
    <div class="file-card-content">
      <div class="file-name-row">
        <h3 :title="file.name">
          {{ file.name }}
        </h3>

        <span class="more-text">···</span>
      </div>

      <p class="file-meta">
        {{ file.type }}

        <template v-if="file.size">
          · {{ file.size }}
        </template>
      </p>

      <div class="file-bottom">
        <p class="file-date">
          업로드 {{ file.uploadedAt }}

          <template v-if="file.updatedAt">
            · 수정 {{ file.updatedAt }}
          </template>
        </p>

        <!-- 모든 파일에 즐겨찾기 표시 -->
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
.file-card {
  min-width: 0;
  overflow: hidden;
  background: #fff;
  border: 1px solid #eceff4;
  border-radius: 13px;
  transition: border-color .2s, box-shadow .2s;
}

.file-card.clickable {
  cursor: pointer;
}

.file-card:hover {
  border-color: #ffc3d3;
  box-shadow: 0 5px 18px rgba(42, 51, 72, .06);
}

.file-thumbnail {
  position: relative;
  aspect-ratio: 1.65 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-design {
  width: 70%;
  height: 57%;
  background: #fff;
  border-radius: 5px;
  box-shadow: 0 5px 16px rgba(60, 38, 48, .09);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  transform: rotate(-4deg);
}

.thumbnail-cherry {
  color: #f66592;
  font-size: 15px;
  letter-spacing: -5px;
}

.thumbnail-title {
  color: #c94f76;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 2px;
}

.thumbnail-caption {
  color: #bc9aa7;
  font-size: 6px;
  letter-spacing: 1px;
}

.file-extension {
  position: absolute;
  right: 9px;
  bottom: 9px;
  background: #fff;
  color: #69758b;
  border-radius: 5px;
  padding: 4px 6px;
  font-size: 10px;
}

.file-card-content {
  padding: 11px 12px 12px;
}

.file-name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
}

.file-name-row h3 {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 600;
  margin: 0;
  color: #30394a;
}

.more-text {
  color: #8f9aae;
  font-size: 18px;
}

.file-meta {
  margin: 9px 0 6px;
  color: #8c96a8;
  font-size: 12px;
}

.file-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.file-date {
  margin: 0;
  color: #8994a8;
  font-size: 11px;
  line-height: 1.6;
}

.favorite-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;
}

.favorite-btn img {
  width: 20px;
  height: 20px;
}
</style>
