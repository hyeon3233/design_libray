
<script setup>
import {
  computed,
  ref,
  onMounted,
  onUnmounted,
  watch
} from 'vue'

import { useRoute } from 'vue-router'

import ItemActionMenu from '../components/ItemActionMenu.vue'
import FileSelectionDeleteModal from '../components/FileSelectionDeleteModal.vue'

import {
  favoriteFiles,
  isFavorite,
  toggleFavorite
} from '../stores/favorites'

import { isFileHidden } from '../stores/trash'

import {
  fileSelectionKey,
  registerSelectableFile,
  unregisterSelectableFile,
  isFileSelected,
  selectFileCard,
  clearFileSelection
} from '../stores/fileSelection'

import favoriteOff from '../assets/icon/Favorit_off.svg'
import favoriteOn from '../assets/icon/Favorit_on.svg'

import galleryOff from '../assets/icon/gallery_off.svg'
import galleryOn from '../assets/icon/gallery_on.svg'
import listOff from '../assets/icon/List_off.svg'
import listOn from '../assets/icon/List_on.svg'

const route = useRoute()

const viewMode = ref('gallery')
const searchQuery = ref('')

// 각 파일의 선택 모달 담당 ID
const ownerIds = new Map()

function getOwnerId(file) {
  const key = fileSelectionKey(file)

  if (!ownerIds.has(key)) {
    ownerIds.set(key, Symbol(`favorite-${key}`))
  }

  return ownerIds.get(key)
}

// 즐겨찾기 검색 / 휴지통 파일 제외
const filteredFavorites = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return favoriteFiles.value
    .filter(file => !isFileHidden(file))
    .filter(file => {
      if (!query) return true

      const searchableText = [
        file.name,
        file.folderName,
        file.type,
        ...(file.tags || [])
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchableText.includes(query)
    })
})

// 선택 가능 파일 목록 갱신
function syncRegisteredFiles() {
  filteredFavorites.value.forEach(file => {
    registerSelectableFile(file)
  })
}

onMounted(syncRegisteredFiles)

watch(filteredFavorites, (newFiles, oldFiles = []) => {
  oldFiles.forEach(file => {
    if (!newFiles.some(
      item => fileSelectionKey(item) === fileSelectionKey(file)
    )) {
      unregisterSelectableFile(file)
    }
  })

  newFiles.forEach(registerSelectableFile)
})

onUnmounted(() => {
  filteredFavorites.value.forEach(unregisterSelectableFile)
  clearFileSelection()
})

watch(
  () => route.fullPath,
  () => clearFileSelection()
)

// 파일 클릭 → 선택
function handleFileClick(file, event) {
  selectFileCard(
    file,
    event,
    getOwnerId(file)
  )
}

// 즐겨찾기 해제
function removeFavorite(file) {
  toggleFavorite(file, {
    id: file.folderId ?? 'home',
    name: file.folderName || '홈 파일'
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

    <!-- 상단 도구 -->
    <div class="favorites-toolbar">

      <div class="section-title">
        <h2>즐겨찾기 파일</h2>

        <span class="file-count">
          {{ filteredFavorites.length }}
        </span>
      </div>

      <div class="toolbar-actions">

        <!-- 검색 -->
        <div class="favorite-search">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="즐겨찾기 파일 검색..."
            aria-label="즐겨찾기 파일 검색"
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
      data-file-selection-scope
    >
      <div
        v-for="file in filteredFavorites"
        :key="`${file.folderId}-${file.id}`"
        class="file-card"
        :class="{ selected: isFileSelected(file) }"
        :data-file-select-key="fileSelectionKey(file)"
        @click.stop="handleFileClick(file, $event)"
      >
        <!-- 썸네일 -->
        <div
          class="file-thumbnail"
          :style="{
            backgroundColor: file.color || '#FFE8EF'
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

          <span class="file-extension">
            {{ file.type }}
          </span>

          <span
            v-if="isFileSelected(file)"
            class="selected-mark"
            aria-hidden="true"
          >
            ✓
          </span>
        </div>

        <!-- 파일 정보 -->
        <div class="file-card-content">

          <!-- 이름 / 더보기 -->
          <div class="file-name-row">
            <h3 :title="file.name">
              {{ file.name }}
            </h3>

            <div class="file-menu-area" @click.stop>
              <ItemActionMenu
                type="file"
                :item="file"
                :is-favorited="
                  isFavorite(
                    file.folderId ?? 'home',
                    file.id
                  )
                "
                @favorite="removeFavorite"
              />
            </div>
          </div>

          <!-- 확장자 및 크기 -->
          <p class="file-meta">
            {{ file.type }}

            <template v-if="file.size">
              · {{ file.size }}
            </template>
          </p>

          <!-- 날짜 / 즐겨찾기 -->
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

                <span>
                  수정 {{ file.updatedAt }}
                </span>
              </template>
            </p>

            <button
              type="button"
              class="favorite-btn"
              :aria-label="
                isFavorite(
                  file.folderId ?? 'home',
                  file.id
                )
                  ? '즐겨찾기 해제'
                  : '즐겨찾기 추가'
              "
              :aria-pressed="
                isFavorite(
                  file.folderId ?? 'home',
                  file.id
                )
              "
              @click.stop="removeFavorite(file)"
            >
              <img
                :src="
                  isFavorite(
                    file.folderId ?? 'home',
                    file.id
                  )
                    ? favoriteOn
                    : favoriteOff
                "
                alt=""
              />
            </button>
          </div>

          <!-- 원본 폴더명 -->
          <p class="folder-label">
            {{ file.folderName || '홈 파일' }}
          </p>
        </div>

        <!-- 공통 키보드 삭제 확인창 -->
        <FileSelectionDeleteModal
          :owner-id="getOwnerId(file)"
        />
      </div>
    </div>

    <!-- 비어 있는 경우 -->
    <div v-else class="empty-state">
      <div class="empty-icon">☆</div>

      <h3>
        {{
          searchQuery
            ? '검색 결과가 없어요.'
            : '아직 즐겨찾기한 파일이 없어요.'
        }}
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

/* 상단 도구 */
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

/* 갤러리 / 목록 보기 */
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

/* 파일 카드 */
.file-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
}

.file-card {
  position: relative;
  min-width: 0;
  overflow: visible;
  border: 1px solid #eceff4;
  border-radius: 13px;
  background: #fff;
  cursor: pointer;

  transition:
    border-color 0.2s,
    background-color 0.2s,
    box-shadow 0.2s;
}

.file-card:hover {
  border-color: #ffc3d3;
  box-shadow: 0 5px 18px rgba(42, 51, 72, 0.06);
}

/* 선택된 파일 */
.file-card.selected {
  border: 2px solid #ff366b;
  background: #fff8fa;
  box-shadow:
    0 0 0 2px rgba(255, 54, 107, 0.08);
}

.file-card:focus-within,
.file-card:has(.action-menu-root.is-open) {
  z-index: 200;
}

.file-thumbnail {
  position: relative;
  aspect-ratio: 1.65 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  border-radius: 12px 12px 0 0;
}

.preview-image {
  width: 100%;
  height: 100%;
  display: block;
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
  background: rgba(255, 255, 255, .92);
  color: #69758b;
  border: 1px solid #edeff2;
  border-radius: 5px;
  padding: 4px 6px;
  font-size: 10px;
  font-weight: 600;
}

.selected-mark {
  position: absolute;
  top: 9px;
  left: 9px;
  width: 23px;
  height: 23px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  background: #ff366b;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
}

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
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 600;
  color: #30394a;
  margin: 0;
}

.file-menu-area {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 10;
  cursor: default;
}

.file-meta {
  margin: 9px 0 6px;
  color: #8c96a8;
  font-size: 12px;
}

.file-meta span {
  margin: 0 4px;
}

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
  border-radius: 12px 0 0 12px;
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

/* 비어 있는 화면 */
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
