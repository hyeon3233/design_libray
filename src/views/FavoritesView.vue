
<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import {
  favoriteFiles,
  isFavorite,
  toggleFavorite
} from '../stores/favorites'

import favoriteOff from '../assets/icon/Favorit_off.svg'
import favoriteOn from '../assets/icon/Favorit_on.svg'

import galleryOff from '../assets/icon/gallery_off.svg'
import galleryOn from '../assets/icon/gallery_on.svg'
import listOff from '../assets/icon/List_off.svg'
import listOn from '../assets/icon/List_on.svg'

const router = useRouter()

const viewMode = ref('gallery')
const searchQuery = ref('')

// 즐겨찾기 파일 검색
const filteredFavorites = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) return favoriteFiles.value

  return favoriteFiles.value.filter(file =>
    file.name.toLowerCase().includes(query) ||
    file.folderName.toLowerCase().includes(query)
  )
})

// 원래 파일이 들어 있는 폴더로 이동
function openFolder(file) {
  router.push(`/folders/${file.folderId}`)
}

// 즐겨찾기 해제
function removeFavorite(file) {
  toggleFavorite(file, {
    id: file.folderId,
    name: file.folderName
  })
}
</script>

<template>
  <div class="favorites-page">

    <!-- 페이지 제목 -->
    <div class="page-heading">
      <div>
        <h1>즐겨찾기</h1>
        <p>자주 사용하는 디자인 파일을 모아보세요.</p>
      </div>
    </div>

    <!-- 목록 상단 -->
    <div class="favorites-toolbar">
      <div class="section-title">
        <h2>즐겨찾기 파일</h2>
        <span class="file-count">
          {{ filteredFavorites.length }}
        </span>
      </div>

      <div class="toolbar-actions">
        <!-- 파일 검색 -->
        <div class="favorite-search">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="즐겨찾기 파일 검색..."
          />
        </div>

        <!-- 갤러리 / 목록 보기 -->
        <div class="view-options">
          <button
            type="button"
            :class="{ active: viewMode === 'gallery' }"
            :aria-pressed="viewMode === 'gallery'"
            aria-label="갤러리 보기"
            title="갤러리 보기"
            @click="viewMode = 'gallery'"
          >
            <img
              :src="viewMode === 'gallery' ? galleryOn : galleryOff"
              alt=""
              class="view-mode-icon icon-normal"
            />
            <img
              :src="galleryOn"
              alt=""
              class="view-mode-icon icon-hover"
            />
          </button>

          <button
            type="button"
            :class="{ active: viewMode === 'list' }"
            :aria-pressed="viewMode === 'list'"
            aria-label="목록 보기"
            title="목록 보기"
            @click="viewMode = 'list'"
          >
            <img
              :src="viewMode === 'list' ? listOn : listOff"
              alt=""
              class="view-mode-icon icon-normal"
            />
            <img
              :src="listOn"
              alt=""
              class="view-mode-icon icon-hover"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- 즐겨찾기 파일 카드 -->
    <div
      v-if="filteredFavorites.length"
      class="file-grid"
      :class="{ 'list-mode': viewMode === 'list' }"
    >
      <div
        v-for="file in filteredFavorites"
        :key="`${file.folderId}-${file.id}`"
        class="file-card"
      >
        <!-- 파일 썸네일 -->
        <div
          class="file-thumbnail"
          :style="{ backgroundColor: file.color || '#FFE8EF' }"
          @click="openFolder(file)"
        >
          <div class="thumbnail-design">
            <span class="thumbnail-cherry">● ●</span>
            <span class="thumbnail-title">CHERRY</span>
            <span class="thumbnail-caption">
              DESIGN ARCHIVE
            </span>
          </div>

          <span class="file-extension">
            {{ file.type }}
          </span>
        </div>

        <!-- 파일 정보 -->
        <div class="file-card-content">

          <div class="file-name-row">
            <h3
              :title="file.name"
              @click="openFolder(file)"
            >
              {{ file.name }}
            </h3>
            <span class="file-more">···</span>
          </div>

          <p class="file-meta">
            {{ file.type }}
            <span>·</span>
            {{ file.size }}
          </p>

          <!-- 업로드 / 수정 날짜 + 즐겨찾기 -->
          <div class="file-bottom">
            <p class="file-date">
              <span v-if="file.uploadedAt">
                업로드 {{ file.uploadedAt }}
              </span>

              <template v-if="file.updatedAt">
                <span
                  v-if="file.uploadedAt"
                  class="date-divider"
                >
                  ·
                </span>
                <span>수정 {{ file.updatedAt }}</span>
              </template>
            </p>

            <button
              type="button"
              class="favorite-btn"
              aria-label="즐겨찾기 해제"
              :aria-pressed="isFavorite(file.folderId, file.id)"
              @click.stop="removeFavorite(file)"
            >
              <img
                :src="isFavorite(file.folderId, file.id) ? favoriteOn : favoriteOff"
                alt=""
              />
            </button>
          </div>

          <p class="folder-label">
            {{ file.folderName }}
          </p>
        </div>
      </div>
    </div>

    <!-- 빈 화면 -->
    <div v-else class="empty-state">
      <div class="empty-icon">☆</div>

      <h3>
        {{ searchQuery ? '검색 결과가 없어요.' : '아직 즐겨찾기한 파일이 없어요.' }}
      </h3>

      <p>
        {{
          searchQuery
            ? '다른 검색어로 검색해보세요.'
            : '파일 카드의 별을 누르면 이곳에 표시돼요.'
        }}
      </p>
    </div>

  </div>
</template>

<style scoped>
.favorites-page {
  width: 100%;
  min-width: 0;
}

/* 상단 제목 */
.page-heading {
  margin-bottom: 35px;
}

.page-heading h1 {
  margin: 0 0 10px;
  font-size: 30px;
  font-weight: 700;
  color: #111;
}

.page-heading p {
  margin: 0;
  font-size: 15px;
  color: #7b89a5;
}

/* 목록 상단 */
.favorites-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #252c39;
}

.file-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  height: 28px;
  box-sizing: border-box;
  padding: 0 9px;
  border-radius: 20px;
  background: #f1f3f7;
  color: #53647f;
  font-size: 13px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.favorite-search {
  width: 220px;
  height: 42px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  border: 1px solid #e9ecf2;
  border-radius: 10px;
  box-sizing: border-box;
}

.favorite-search input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: #30394a;
  font-size: 13px;
}

.favorite-search input::placeholder {
  color: #a0aabc;
}

/* 갤러리 / 목록 */
.view-options {
  display: flex;
  gap: 4px;
  padding: 4px;
  border: 1px solid #e9ebf0;
  border-radius: 11px;
}

.view-options button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
}

.view-options button.active {
  background: #fff0f4;
}

.view-mode-icon {
  width: 17px;
  height: 17px;
  object-fit: contain;
}

.view-options .icon-normal {
  display: block;
}

.view-options .icon-hover {
  display: none;
}

.view-options button:not(.active):hover .icon-normal {
  display: none;
}

.view-options button:not(.active):hover .icon-hover {
  display: block;
}

/* 카드 배치 */
.file-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
}

.file-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid #eceff4;
  border-radius: 13px;
  background: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.file-card:hover {
  border-color: #ffc3d3;
  box-shadow: 0 5px 18px rgba(42, 51, 72, 0.06);
}

/* 파일 썸네일 */
.file-thumbnail {
  position: relative;
  aspect-ratio: 1.65 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
}

.thumbnail-design {
  width: 70%;
  height: 57%;
  background: white;
  border-radius: 5px;
  box-shadow: 0 5px 16px rgba(60, 38, 48, 0.09);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 3px;
  transform: rotate(-4deg);
}

.thumbnail-cherry {
  color: #f66592;
  font-size: 15px;
  letter-spacing: -5px;
  transform: rotate(10deg);
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
  background: rgba(255, 255, 255, 0.92);
  color: #69758b;
  border: 1px solid #edeff2;
  border-radius: 5px;
  padding: 4px 6px;
  font-size: 10px;
  font-weight: 600;
}

/* 파일 정보 */
.file-card-content {
  padding: 11px 12px 12px;
}

.file-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

.file-name-row h3 {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 600;
  color: #30394a;
  cursor: pointer;
  margin: 0;
}

.file-more {
  flex-shrink: 0;
  color: #8f9aae;
  font-size: 18px;
  line-height: 1;
}

/* 파일 형식 / 크기 */
.file-meta {
  margin: 9px 0 6px;
  color: #8c96a8;
  font-size: 12px;
}

.file-meta span {
  margin: 0 4px;
}

/* 날짜 / 즐겨찾기 */
.file-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.file-date {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  margin: 0;
  color: #8994a8;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
}

.date-divider {
  color: #b8c0cf;
}

.favorite-btn {
  width: 28px;
  height: 28px;
  padding: 4px;
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

.folder-label {
  margin: 6px 0 0;
  color: #a0aabc;
  font-size: 11px;
}

/* 목록 보기 */
.file-grid.list-mode {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.file-grid.list-mode .file-card {
  display: flex;
  align-items: center;
}

.file-grid.list-mode .file-thumbnail {
  width: 115px;
  height: 75px;
  aspect-ratio: auto;
  flex-shrink: 0;
}

.file-grid.list-mode .file-card-content {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 24px;
  min-width: 0;
}

.file-grid.list-mode .file-name-row {
  flex: 1;
  min-width: 0;
}

.file-grid.list-mode .file-meta,
.file-grid.list-mode .file-date,
.file-grid.list-mode .folder-label {
  margin: 0;
}

.file-grid.list-mode .file-bottom {
  gap: 12px;
}

/* 빈 화면 */
.empty-state {
  min-height: 260px;
  padding: 55px 20px;
  box-sizing: border-box;
  border: 1px dashed #dce2eb;
  border-radius: 15px;
  text-align: center;
}

.empty-icon {
  font-size: 43px;
  color: #ff7296;
}

.empty-state h3 {
  margin: 14px 0 8px;
  font-size: 17px;
  color: #374052;
}

.empty-state p {
  font-size: 13px;
  color: #8994a8;
}

@media (max-width: 1400px) {
  .file-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .file-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .favorites-toolbar {
    flex-wrap: wrap;
  }

  .file-grid.list-mode .file-card-content {
    flex-wrap: wrap;
    gap: 10px;
  }
}
</style>
