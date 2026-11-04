
<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { folderList } from '../stores/folders'
import { allFiles } from '../stores/files'

import {
  saveUpload,
  uploadedFilesReady
} from '../stores/uploadedFiles'

import {
  isFavorite,
  toggleFavorite
} from '../stores/favorites'

import UploadModal from '../components/UploadModal.vue'

// 갤러리 / 목록 보기 SVG 아이콘
import galleryOff from '../assets/icon/gallery_off.svg'
import galleryOn from '../assets/icon/gallery_on.svg'
import listOff from '../assets/icon/List_off.svg'
import listOn from '../assets/icon/List_on.svg'

// 즐겨찾기 SVG 아이콘
import favoriteOff from '../assets/icon/Favorit_off.svg'
import favoriteOn from '../assets/icon/Favorit_on.svg'

const route = useRoute()

// 주소의 ID로 현재 폴더 찾기
const folder = computed(() =>
  folderList.value.find(
    item => String(item.id) === String(route.params.id)
  )
)

// 폴더 내부 기능
const searchQuery = ref('')
const viewMode = ref('gallery')
const currentPage = ref(1)
const pageSize = 30

// 기존 파일 + 새로 업로드한 파일
const files = computed(() =>
  allFiles.value.filter(
    file =>
      String(file.folderId) ===
      String(route.params.id)
  )
)

// 현재 폴더의 하위 폴더
const childFolders = computed(() =>
  folderList.value.filter(
    item =>
      item.parentFolderId != null &&
      String(item.parentFolderId) ===
      String(route.params.id)
  )
)

// 폴더 내부 검색
const filteredFiles = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) {
    return files.value
  }

  return files.value.filter(file => {
    const name = String(file.name || '').toLowerCase()
    const type = String(file.type || '').toLowerCase()

    const tags = Array.isArray(file.tags)
      ? file.tags.join(' ').toLowerCase()
      : String(file.tags || '').toLowerCase()

    return (
      name.includes(query) ||
      type.includes(query) ||
      tags.includes(query)
    )
  })
})

// 총 페이지 수
const totalPages = computed(() =>
  Math.max(
    1,
    Math.ceil(filteredFiles.value.length / pageSize)
  )
)

// 현재 페이지 파일
const paginatedFiles = computed(() => {
  const start = (currentPage.value - 1) * pageSize

  return filteredFiles.value.slice(
    start,
    start + pageSize
  )
})

// 검색어나 폴더가 바뀌면 첫 페이지로 이동
watch(
  [searchQuery, () => route.params.id],
  () => {
    currentPage.value = 1
  }
)

// 파일 개수 감소 시 현재 페이지 보정
watch(totalPages, pages => {
  if (currentPage.value > pages) {
    currentPage.value = pages
  }
})

// 임시 관리자 표시 상태
// 실제 권한은 추후 로그인 시스템에서 처리
const isAdmin = ref(false)

// 업로드 모달
const showUploadModal = ref(false)

// 업로드 상태
const isUploading = ref(false)
const uploadMessage = ref('')
const uploadError = ref(false)

// 업로드 모달 열기
function openUploadModal() {
  if (!folder.value || isUploading.value) {
    return
  }

  uploadMessage.value = ''
  uploadError.value = false
  showUploadModal.value = true
}

// 업로드 모달 닫기
function closeUploadModal() {
  if (isUploading.value) {
    return
  }

  showUploadModal.value = false
}

// 파일 및 폴더 업로드
async function handleModalUpload(payload) {
  if (isUploading.value || !folder.value) {
    return
  }

  isUploading.value = true
  uploadMessage.value = ''
  uploadError.value = false

  try {
    // 기존 업로드 데이터 로딩 완료 확인
    await uploadedFilesReady

    // 파일 및 폴더 실제 저장
    const result = await saveUpload(
      payload,
      folder.value
    )

    // 업로드 파일이 바로 보이도록 초기화
    searchQuery.value = ''
    currentPage.value = 1

    // 성공 시에만 모달 닫기
    showUploadModal.value = false

    uploadMessage.value =
      `${result.files}개 파일, ` +
      `${result.folders}개 폴더가 등록되었어요.`
  } catch (error) {
    console.error('파일 업로드 실패:', error)

    uploadError.value = true
    uploadMessage.value =
      error?.message || '파일 업로드에 실패했어요.'
  } finally {
    isUploading.value = false
  }
}
</script>

<template>
  <div class="folder-page">
    <template v-if="folder">

      <!-- 상단 경로 -->
      <div class="breadcrumb">
        <RouterLink to="/">
          홈
        </RouterLink>

        <span class="breadcrumb-arrow">›</span>

        <RouterLink to="/projects">
          모든 폴더
        </RouterLink>

        <span class="breadcrumb-arrow">›</span>

        <strong>{{ folder.name }}</strong>
      </div>

      <!-- 폴더 상단 정보 -->
      <div class="folder-header">

        <!-- 왼쪽: 폴더 정보 -->
        <div class="folder-heading-group">
          <div
            class="folder-icon-box"
            :style="{
              backgroundColor: folder.color || '#E9F2FF'
            }"
          >
            <svg
              viewBox="0 0 24 24"
              width="38"
              height="38"
              fill="none"
              stroke="#FF6592"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path
                d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10H3V7z"
              />
            </svg>
          </div>

          <div class="folder-heading-text">
            <h1>{{ folder.name }}</h1>

            <p>
              {{ folder.category }}
              ·
              {{ files.length }}개 파일
            </p>

            <p class="folder-description">
              {{
                folder.description ||
                '디자인 자료를 모아둔 폴더입니다.'
              }}
            </p>
          </div>
        </div>

        <!-- 오른쪽: 버튼 한 줄 -->
        <div class="folder-header-actions">

          <!-- 폴더 내부 검색 -->
          <div class="search-box">
            <span class="search-icon">⌕</span>

            <input
              v-model="searchQuery"
              type="search"
              placeholder="이 폴더에서 검색하기..."
            />
          </div>

          <!-- 갤러리 / 목록 보기 -->
          <div class="view-options">
            <button
              type="button"
              :class="{
                active: viewMode === 'gallery'
              }"
              :aria-pressed="viewMode === 'gallery'"
              aria-label="갤러리 보기"
              title="갤러리 보기"
              @click="viewMode = 'gallery'"
            >
              <img
                :src="
                  viewMode === 'gallery'
                    ? galleryOn
                    : galleryOff
                "
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
              :class="{
                active: viewMode === 'list'
              }"
              :aria-pressed="viewMode === 'list'"
              aria-label="목록 보기"
              title="목록 보기"
              @click="viewMode = 'list'"
            >
              <img
                :src="
                  viewMode === 'list'
                    ? listOn
                    : listOff
                "
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

          <!-- 파일 업로드 -->
          <button
            type="button"
            class="upload-btn"
            :disabled="isUploading"
            @click="openUploadModal"
          >
            <span>＋</span>

            {{
              isUploading
                ? '업로드 중...'
                : '파일 업로드'
            }}
          </button>

          <!-- 관리자 전용 -->
          <button
            v-if="isAdmin"
            type="button"
            class="folder-settings-btn"
            title="폴더 설정"
          >
            ···
          </button>
        </div>
      </div>

      <!-- 업로드 결과 메시지 -->
      <p
        v-if="uploadMessage"
        class="upload-message"
        :class="{ error: uploadError }"
        role="status"
      >
        {{ uploadMessage }}
      </p>

      <!-- 현재 폴더의 하위 폴더 -->
      <section
        v-if="childFolders.length"
        class="child-folders-section"
      >
        <div class="section-top">
          <div class="section-title">
            <h2>하위 폴더</h2>

            <span class="file-count">
              {{ childFolders.length }}
            </span>
          </div>
        </div>

        <div class="child-folder-grid">
          <RouterLink
            v-for="child in childFolders"
            :key="child.id"
            :to="`/folders/${child.id}`"
            class="child-folder-card"
          >
            <div
              class="child-folder-icon"
              :style="{
                backgroundColor:
                  child.color || '#E9F2FF'
              }"
            >
              <svg
                width="27"
                height="27"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FF6592"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path
                  d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10H3V7z"
                />
              </svg>
            </div>

            <div class="child-folder-info">
              <strong :title="child.name">
                {{ child.name }}
              </strong>

              <span>
                {{ child.category }}
              </span>
            </div>
          </RouterLink>
        </div>
      </section>

      <!-- 파일 목록 -->
      <section class="file-section">

        <div class="section-top">
          <div class="section-title">
            <h2>전체 파일</h2>

            <span class="file-count">
              {{ filteredFiles.length }}
            </span>
          </div>
        </div>

        <!-- 파일 카드 -->
        <div
          v-if="paginatedFiles.length"
          class="file-grid"
          :class="{
            'list-mode': viewMode === 'list'
          }"
        >
          <div
            v-for="file in paginatedFiles"
            :key="file.id"
            class="file-card"
          >
            <!-- 파일 썸네일 -->
            <div
              class="file-thumbnail"
              :style="{
                backgroundColor:
                  file.color || '#F5E9F0'
              }"
            >
              <!-- 실제 업로드 이미지 -->
              <img
                v-if="file.thumbnail"
                :src="file.thumbnail"
                :alt="file.name"
                class="file-preview-image"
              />

              <!-- 이미지가 없는 파일 -->
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

                <button
                  type="button"
                  class="file-more"
                  title="파일 메뉴"
                >
                  ···
                </button>
              </div>

              <p class="file-meta">
                {{ file.type }}

                <span>·</span>

                {{ file.size }}
              </p>

              <!-- 날짜 및 즐겨찾기 -->
              <div class="file-bottom">

                <p class="flie-date">
                  <span>
                    업로드 {{ file.uploadedAt }}
                  </span>

                  <template v-if="file.updatedAt">
                    <span class="date-divider">
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
                    isFavorite(folder.id, file.id)
                      ? '즐겨찾기 해제'
                      : '즐겨찾기 추가'
                  "
                  :aria-pressed="
                    isFavorite(folder.id, file.id)
                  "
                  @click.stop="
                    toggleFavorite(file, folder)
                  "
                >
                  <img
                    :src="
                      isFavorite(folder.id, file.id)
                        ? favoriteOn
                        : favoriteOff
                    "
                    alt=""
                  />
                </button>
              </div>

            </div>
          </div>
        </div>

        <!-- 파일이 없는 경우 -->
        <div
          v-else
          class="empty-files"
        >
          <div class="empty-icon">
            📂
          </div>

          <h3>
            {{
              searchQuery
                ? '검색 결과가 없어요.'
                : '아직 등록된 파일이 없어요.'
            }}
          </h3>

          <p>
            {{
              searchQuery
                ? '다른 검색어를 입력해보세요.'
                : '파일 업로드 버튼에서 디자인 자료를 추가할 수 있어요.'
            }}
          </p>
        </div>

        <!-- 페이지 이동 -->
        <div
          v-if="filteredFiles.length > 0"
          class="pagination-area"
        >
          <span class="pagination-info">
            총 {{ filteredFiles.length }}개 중
            {{ (currentPage - 1) * pageSize + 1 }}–{{
              Math.min(
                currentPage * pageSize,
                filteredFiles.length
              )
            }}개 표시
          </span>

          <div class="pagination">
            <button
              type="button"
              :disabled="currentPage === 1"
              @click="currentPage--"
            >
              ‹
            </button>

            <button
              v-for="page in totalPages"
              :key="page"
              type="button"
              :class="{
                active: currentPage === page
              }"
              @click="currentPage = page"
            >
              {{ page }}
            </button>

            <button
              type="button"
              :disabled="
                currentPage === totalPages
              "
              @click="currentPage++"
            >
              ›
            </button>
          </div>

          <span class="page-size">
            페이지당 {{ pageSize }}개
          </span>
        </div>
      </section>

      <!-- 파일 업로드 모달 -->
      <!-- 전체 페이지에서 한 번만 선언 -->
      <UploadModal
        v-if="showUploadModal && folder"
        :folder="folder"
        @close="closeUploadModal"
        @upload="handleModalUpload"
      />

    </template>

    <!-- 존재하지 않는 폴더 -->
    <div
      v-else
      class="folder-not-found"
    >
      <div class="empty-icon">
        📂
      </div>

      <h2>
        폴더를 찾을 수 없어요.
      </h2>

      <p>
        삭제되었거나 존재하지 않는 폴더예요.
      </p>

      <RouterLink to="/">
        홈으로 돌아가기
      </RouterLink>
    </div>

  </div>
</template>

<style scoped>
/* 전체 페이지 */
.folder-page {
  width: 100%;
  min-width: 0;
}

/* 상단 경로 */
.breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
  color: #8c97a9;
  font-size: 13px;
}

.breadcrumb a {
  color: #8c97a9;
  text-decoration: none;
}

.breadcrumb a:hover {
  color: #ff366b;
}

.breadcrumb strong {
  color: #363f50;
  font-weight: 600;
}

.breadcrumb-arrow {
  color: #bec5d0;
  font-size: 18px;
}

/* 폴더 상단 */
.folder-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.folder-heading-group {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
  flex-shrink: 0;
}

.folder-icon-box {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 15px;
}

.folder-heading-text {
  min-width: 0;
}

.folder-heading-text h1 {
  margin: 0 0 8px;
  color: #222936;
  font-size: 27px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.folder-heading-text p {
  margin: 0;
  color: #8b96a9;
  font-size: 13px;
}

.folder-description {
  margin-top: 6px !important;
  color: #8b96a9;
  font-size: 13px;
}

/* 오른쪽 버튼 영역 */
.folder-header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: nowrap;
  gap: 10px;
  min-width: 0;
}

/* 폴더 검색 */
.search-box {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 220px;
  min-width: 130px;
  height: 40px;
  padding: 0 12px;
  box-sizing: border-box;
  border: 1px solid #e9ecf2;
  border-radius: 10px;
  background: #fff;
}

.search-icon {
  color: #a2aabc;
  font-size: 23px;
}

.search-box input {
  width: 100%;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: #30394a;
  font-size: 13px;
}

.search-box input::placeholder {
  color: #a0aabc;
}

/* 갤러리 / 목록 버튼 */
.view-options {
  display: flex;
  gap: 4px;
  padding: 4px;
  flex-shrink: 0;
  border: 1px solid #e9ebf0;
  border-radius: 11px;
  white-space: nowrap;
}

.view-options button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #8190a8;
  cursor: pointer;
}

.view-options button.active {
  background: #fff0f4;
  color: #ff366b;
}

.view-mode-icon {
  width: 17px;
  height: 17px;
  object-fit: contain;
  flex-shrink: 0;
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

/* 업로드 버튼 */
.upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  flex-shrink: 0;
  padding: 13px 20px;
  border: none;
  border-radius: 11px;
  background: #ff366b;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.upload-btn:hover:not(:disabled) {
  background: #ed275b;
}

.upload-btn span {
  font-size: 20px;
  line-height: 1;
}

.upload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 관리자 설정 버튼 */
.folder-settings-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  padding: 0;
  border: 1px solid #e9ecf2;
  border-radius: 11px;
  background: #f7f8fb;
  color: #65718a;
  font-size: 22px;
  cursor: pointer;
}

.folder-settings-btn:hover {
  background: #fff0f4;
  color: #ff366b;
}

/* 업로드 결과 안내 */
.upload-message {
  margin: 16px 0 24px;
  padding: 13px 16px;
  border-radius: 10px;
  background: #fff0f4;
  color: #ed3166;
  font-size: 13px;
}

.upload-message.error {
  background: #fff1f0;
  color: #ce3030;
}

/* 파일 영역 */
.file-section {
  width: 100%;
}

.section-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title h2 {
  margin: 0;
  color: #252c39;
  font-size: 20px;
  font-weight: 700;
}

.file-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  height: 28px;
  padding: 0 9px;
  box-sizing: border-box;
  border-radius: 20px;
  background: #f1f3f7;
  color: #53647f;
  font-size: 13px;
}

/* 파일 카드 - 5열 */
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
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.file-card:hover {
  border-color: #ffc3d3;
  box-shadow:
    0 5px 18px rgba(42, 51, 72, 0.06);
}

/* 파일 썸네일 */
.file-thumbnail {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  aspect-ratio: 1.65 / 1;
}

.file-preview-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-design {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  width: 70%;
  height: 57%;
  border-radius: 5px;
  background: #fff;
  box-shadow:
    0 5px 16px rgba(60, 38, 48, 0.09);
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
  padding: 4px 6px;
  border: 1px solid #edeff2;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.92);
  color: #69758b;
  font-size: 10px;
  font-weight: 600;
}

/* 파일 카드 정보 */
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
  margin: 0;
  color: #30394a;
  font-size: 13px;
  font-weight: 600;
}

.file-more {
  flex-shrink: 0;
  padding: 0 3px;
  border: none;
  background: transparent;
  color: #8f9aae;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}

.file-meta {
  margin: 9px 0 6px;
  color: #8c96a8;
  font-size: 12px;
}

.file-meta span {
  margin: 0 4px;
}

/* 날짜와 즐겨찾기 */
.file-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.file-bottom .flie-date {
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

.favorite-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  padding: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.favorite-btn img {
  width: 20px;
  height: 20px;
  object-fit: contain;
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
  flex-shrink: 0;
  aspect-ratio: auto;
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
.file-grid.list-mode .flie-date {
  margin: 0;
}

.file-grid.list-mode .file-bottom {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 파일이 없는 경우 */
.empty-files {
  min-height: 260px;
  padding: 55px 20px;
  box-sizing: border-box;
  border: 1px dashed #dce2eb;
  border-radius: 15px;
  background: #fff;
  text-align: center;
}

.empty-icon {
  font-size: 43px;
}

.empty-files h3 {
  margin: 14px 0 8px;
  color: #374052;
  font-size: 17px;
}

.empty-files p {
  color: #8994a8;
  font-size: 13px;
}

/* 페이지 이동 */
.pagination-area {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 30px;
}

.pagination-info,
.page-size {
  color: #9aa4b6;
  font-size: 12px;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pagination button {
  min-width: 35px;
  height: 35px;
  padding: 0 8px;
  border: 1px solid #e9ecf2;
  border-radius: 9px;
  background: #fff;
  color: #8994a8;
  font-size: 13px;
  cursor: pointer;
}

.pagination button.active {
  border-color: #ff366b;
  background: #ff366b;
  color: #fff;
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 하위 폴더 영역 */
.child-folders-section {
  margin: 30px 0 36px;
}

.child-folder-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
  margin-top: 18px;
}

.child-folder-card {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 13px;
  border: 1px solid #e7eaf1;
  border-radius: 12px;
  background: #fff;
  text-decoration: none;
  transition: border-color 0.2s;
}

.child-folder-card:hover {
  border-color: #ff6a95;
}

.child-folder-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 10px;
}

.child-folder-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.child-folder-info strong {
  overflow: hidden;
  color: #202533;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.child-folder-info span {
  color: #8994aa;
  font-size: 11px;
}

/* 존재하지 않는 폴더 */
.folder-not-found {
  padding: 80px 20px;
  text-align: center;
}

.folder-not-found h2 {
  margin: 16px 0 8px;
  color: #30394a;
}

.folder-not-found p {
  margin-bottom: 20px;
  color: #8994a8;
  font-size: 13px;
}

.folder-not-found a {
  display: inline-block;
  padding: 11px 18px;
  border-radius: 10px;
  background: #ff366b;
  color: white;
  font-size: 13px;
  text-decoration: none;
}

/* 화면 크기에 따른 조절 */
@media (max-width: 1300px) {
  .file-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 1150px) {
  .folder-header {
    flex-wrap: wrap;
  }

  .folder-header-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .child-folder-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1000px) {
  .file-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .pagination-area {
    justify-content: center;
  }
}

@media (max-width: 700px) {
  .file-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .child-folder-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .folder-header {
    align-items: flex-start;
  }

  .folder-heading-text h1 {
    font-size: 23px;
  }

  .folder-header-actions {
    flex-wrap: wrap;
  }

  .file-grid.list-mode .file-card-content {
    flex-wrap: wrap;
    gap: 6px 15px;
  }

  .pagination-info,
  .page-size {
    display: none;
  }
}
</style>
