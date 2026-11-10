
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

const ownerId = Symbol('home-asset-card')

// 파일이 속한 폴더
const folder = computed(() =>
  folderList.value.find(
    item =>
      String(item.id) === String(props.file.folderId)
  )
)

// 즐겨찾기용 폴더 정보
const favoriteFolderId = computed(() =>
  props.file.folderId ?? 'home'
)

const favoriteFolder = computed(() =>
  folder.value ?? {
    id: favoriteFolderId.value,
    name: '홈 파일'
  }
)

// 즐겨찾기 상태
const isFileFavorite = computed(() =>
  isFavorite(
    favoriteFolderId.value,
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

// 파일 카드 선택
function handleCardClick(event) {
  selectFileCard(props.file, event, ownerId)
}

// 기존 메뉴 이벤트
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

onMounted(() => {
  registerSelectableFile(props.file)
})

onUnmounted(() => {
  unregisterSelectableFile(props.file)
})

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

watch(
  () => route.fullPath,
  () => clearFileSelection()
)
</script>

<template>
  <article
    class="asset-card"
    :class="{ selected: isFileSelected(file) }"
    :data-file-select-key="fileSelectionKey(file)"
    @click.stop="handleCardClick"
  >
    <!-- 파일 썸네일 -->
    <div class="asset-thumbnail">
      <img
        v-if="thumbnail"
        :src="thumbnail"
        :alt="title"
      />

      <span v-else>
        이미지 미리보기
      </span>

      <span
        v-if="isFileSelected(file)"
        class="selected-mark"
        aria-hidden="true"
      >
        ✓
      </span>
    </div>

    <!-- 파일 이름 및 관리 메뉴 -->
    <div class="asset-title">
      <h3 :title="title">
        {{ title }}
      </h3>

      <div class="asset-menu-area" @click.stop>
        <ItemActionMenu
          type="file"
          :item="file"
          :current-user-id="currentUserId"
          :is-admin="isAdmin"
          :is-logged-in="isLoggedIn"
          :is-favorited="isFileFavorite"
          @edit="handleEditFile"
          @download="handleDownloadFile"
          @move="handleMoveFile"
          @favorite="handleFavorite"
          @delete="handleDeleteFile"
        />
      </div>
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

    <FileSelectionDeleteModal :owner-id="ownerId" />
  </article>
</template>

<style scoped>
.asset-card {
  position: relative;
  min-width: 0;
  background: #fff;
  border: 1px solid transparent;
  border-radius: 12px;
  overflow: visible;
  cursor: pointer;

  transition:
    border-color 0.2s,
    background-color 0.2s,
    box-shadow 0.2s;
}

/* 선택된 홈 파일 */
.asset-card.selected {
  border: 2px solid #ff366b;
  background: #fff8fa;
  box-shadow:
    0 0 0 2px rgba(255, 54, 107, 0.08);
}

.asset-card:focus-within,
.asset-card:has(.action-menu-root.is-open) {
  z-index: 200;
}

.asset-thumbnail {
  position: relative;
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

.asset-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 9px;
}

.asset-title h3 {
  min-width: 0;
  flex: 1;
  font-size: 14px;
  font-weight: 700;
  color: #18243c;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.asset-menu-area {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 10;
  cursor: default;
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
