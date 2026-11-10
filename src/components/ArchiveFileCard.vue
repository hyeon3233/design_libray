
<script setup>
import {
  computed,
  onMounted,
  onUnmounted,
  watch
} from 'vue'

import { useRoute } from 'vue-router'

import ItemActionMenu from './ItemActionMenu.vue'
import FileSelectionDeleteModal from './FileSelectionDeleteModal.vue'

import { folderList } from '../stores/folders'

import {
  isFavorite,
  toggleFavorite
} from '../stores/favorites'

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

const props = defineProps({
  file: {
    type: Object,
    required: true
  },

  currentUserId: {
    type: [String, Number],
    default: null
  },

  isAdmin: {
    type: Boolean,
    default: false
  },

  isLoggedIn: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'edit',
  'move',
  'download',
  'delete'
])

const route = useRoute()

// 각 카드가 고유하게 갖는 모달 식별자
const ownerId = Symbol('archive-file-card')

// 파일이 속한 폴더
const folder = computed(() =>
  folderList.value.find(
    item =>
      String(item.id) === String(props.file.folderId)
  )
)

// 폴더가 없는 홈 파일도 즐겨찾기 가능
const favoriteFolder = computed(() =>
  folder.value ?? {
    id: 'home',
    name: '홈 파일'
  }
)

// 즐겨찾기 상태
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

// 파일 카드 클릭 → 선택
function handleCardClick(event) {
  selectFileCard(props.file, event, ownerId)
}

// 기존 파일 관리 메뉴 이벤트
function handleEditFile(file) {
  emit('edit', file)
}

function handleMoveFile(file) {
  emit('move', file)
}

function handleDownloadFile(file) {
  emit('download', file)
}

function handleDeleteFile(file) {
  emit('delete', file)
}

// 선택 범위 등록
onMounted(() => {
  registerSelectableFile(props.file)
})

onUnmounted(() => {
  unregisterSelectableFile(props.file)
})

// 파일 객체가 바뀌는 경우 등록 갱신
watch(
  () => props.file,
  (newFile, oldFile) => {
    if (oldFile) {
      unregisterSelectableFile(oldFile)
    }

    if (newFile) {
      registerSelectableFile(newFile)
    }
  }
)

// 페이지 이동 시 선택 초기화
watch(
  () => route.fullPath,
  () => clearFileSelection()
)
</script>

<template>
  <article
    class="file-card"
    :class="{ selected: isFileSelected(file) }"
    :data-file-select-key="fileSelectionKey(file)"
    @click.stop="handleCardClick"
  >
    <!-- 파일 썸네일 -->
    <div
      class="file-thumbnail"
      :style="{
        backgroundColor:
          file.color || '#f5e9f0'
      }"
    >
      <img
        v-if="file.thumbnail"
        :src="file.thumbnail"
        :alt="file.name"
        class="preview-image"
      />

      <div
        v-else
        class="thumbnail-design"
      >
        <span class="thumbnail-cherry">
          ● ●
        </span>

        <span class="thumbnail-title">
          CHERRY
        </span>

        <span class="thumbnail-caption">
          DESIGN ARCHIVE
        </span>
      </div>

      <span class="file-extension">
        {{ file.type }}
      </span>

      <!-- 선택 체크 표시 -->
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
      <div class="file-name-row">
        <h3 :title="file.name">
          {{ file.name }}
        </h3>

        <!-- 기존 관리 메뉴 유지 -->
        <div
          class="file-menu-area"
          @click.stop
        >
          <ItemActionMenu
            type="file"
            :item="file"
            :current-user-id="currentUserId"
            :is-admin="isAdmin"
            :is-logged-in="isLoggedIn"
            :is-favorited="isFileFavorite"
            @edit="handleEditFile"
            @move="handleMoveFile"
            @download="handleDownloadFile"
            @favorite="handleFavorite"
            @delete="handleDeleteFile"
          />
        </div>
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

        <!-- 기존 즐겨찾기 버튼 -->
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

    <!-- Delete 키 공통 삭제창 -->
    <FileSelectionDeleteModal
      :owner-id="ownerId"
    />
  </article>
</template>

<style scoped>
.file-card {
  position: relative;
  min-width: 0;
  overflow: visible;
  background: #fff;
  border: 1px solid #eceff4;
  border-radius: 13px;
  cursor: pointer;

  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    background-color 0.2s;
}

.file-card:hover {
  border-color: #ffc3d3;
  box-shadow:
    0 5px 18px rgba(42, 51, 72, 0.06);
}

/* 선택된 파일 카드 */
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
  border-radius: 12px 12px 0 0;
}

.preview-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-design {
  width: 70%;
  height: 57%;
  background: #fff;
  border-radius: 5px;
  box-shadow:
    0 5px 16px rgba(60, 38, 48, 0.09);

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

/* 선택 체크 표시 */
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
  box-shadow:
    0 2px 6px rgba(255, 54, 107, 0.2);
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
  margin: 0;
  color: #30394a;
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
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: 7px;
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;
}

.favorite-btn:hover {
  background: #fff0f4;
}

.favorite-btn img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}
</style>
