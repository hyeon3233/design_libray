
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

import { folderList } from '../stores/folders'
import { searchQuery } from '../stores/search'
import { homeRecentAssets, searchFiles } from '../stores/files'

import FolderCard from '../components/FolderCard.vue'
import AssetCard from '../components/AssetCard.vue'
import ArchiveFileCard from '../components/ArchiveFileCard.vue'
import CreateFolderModal from '../components/CreateFolderModal.vue'

import chevronRight from '../assets/icon/chevron_1.svg'
import chevronRightOn from '../assets/icon/chevron_1_on.svg'

import galleryOff from '../assets/icon/gallery_off.svg'
import galleryOn from '../assets/icon/gallery_on.svg'
import listOff from '../assets/icon/List_off.svg'
import listOn from '../assets/icon/List_on.svg'

const router = useRouter()

// 폴더 상세 페이지 이동
function openFolder(folder) {
  router.push(`/folders/${folder.id}`)
}

// 갤러리 / 목록 보기
const viewMode = ref('gallery')

function changeViewMode(mode) {
  viewMode.value = mode
}

// 새 폴더 만들기
const showFolderModal = ref(false)
const newFolderName = ref('')
const newFolderCategory = ref('포토 프레임')
const folderError = ref('')

// 폴더 색상
const folderColors = [
  { name: '블루', value: '#E9F2FF' },
  { name: '핑크', value: '#FFE9F0' },
  { name: '민트', value: '#E9F6EE' },
  { name: '옐로우', value: '#FFF5D9' },
  { name: '퍼플', value: '#F1EAFF' }
]

const newFolderColor = ref('#E9F2FF')
const newFolderThumbnail = ref('')

// 폴더 썸네일 업로드
function uploadFolderThumbnail(event) {
  const file = event.target.files?.[0]
  if (!file) return

  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
    alert('PNG, JPG, WEBP 이미지만 업로드할 수 있어요.')
    event.target.value = ''
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('이미지는 5MB 이하로 선택해주세요.')
    event.target.value = ''
    return
  }

  const reader = new FileReader()

  reader.onload = () => {
    newFolderThumbnail.value = reader.result
  }

  reader.readAsDataURL(file)
}

// 폴더 썸네일 삭제
function removeFolderThumbnail() {
  newFolderThumbnail.value = ''
}

// 폴더 생성
function createFolder() {
  const name = newFolderName.value.trim()

  if (!name) {
    folderError.value = '폴더 이름을 입력해주세요.'
    return
  }

  if (folderList.value.some(folder => folder.name === name)) {
    folderError.value = '이미 같은 이름의 폴더가 있어요.'
    return
  }

  const today = new Date()
    .toLocaleDateString('sv-SE')
    .replaceAll('-', '.')

  folderList.value.push({
    id: Date.now(),
    name,
    category: newFolderCategory.value,
    fileCount: 0,
    updatedAt: today,
    color: newFolderColor.value,
    thumbnail: newFolderThumbnail.value
  })

  newFolderName.value = ''
  newFolderCategory.value = '포토 프레임'
  newFolderColor.value = '#E9F2FF'
  newFolderThumbnail.value = ''
  folderError.value = ''
  showFolderModal.value = false
}

// 카테고리 목록
const categories = [
  '전체',
  '포토 프레임',
  'GUI·UI',
  '캐릭터',
  '포스터',
  '배너·현수막',
  'SNS',
  '굿즈',
  '인쇄물',
  '디자인 소스',
  '기타'
]

const selectedCategory = ref('전체')

function selectCategory(category) {
  selectedCategory.value = category
}

// 카테고리별 검색 키워드
const categoryAliases = {
  '포토 프레임': ['포토 프레임', '포토프레임'],
  'GUI·UI': ['GUI·UI', 'GUI', 'UI'],
  '캐릭터': ['캐릭터'],
  '포스터': ['포스터'],
  '배너·현수막': ['배너', '현수막', '배너·현수막'],
  'SNS': ['SNS', '카드뉴스'],
  '굿즈': ['굿즈'],
  '인쇄물': ['인쇄물', '명함', '리플렛', '전단지', '브로슈어'],
  '디자인 소스': ['디자인 소스', '아이콘', '폰트', '일러스트'],
  '기타': ['기타']
}

// 폴더 필터 및 검색
const filteredFolders = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return folderList.value.filter(folder => {
    const keywords =
      categoryAliases[selectedCategory.value] || []

    const categoryMatch =
      selectedCategory.value === '전체' ||
      keywords.includes(folder.category)

    const searchMatch =
      !query ||
      [folder.name, folder.category].some(value =>
        String(value ?? '').toLowerCase().includes(query)
      )

    return categoryMatch && searchMatch
  })
})

// 파일 필터 및 전체 검색
const filteredAssets = computed(() => {
  const query = searchQuery.value.trim()

  // 검색 중에는 모든 폴더의 파일 검색
  if (query) {
    return searchFiles(query)
  }

  // 평소 홈에서는 기존 파일 6개 표시
  const keywords =
    categoryAliases[selectedCategory.value] || []

  return homeRecentAssets
    .filter(asset =>
      selectedCategory.value === '전체' ||
      (asset.tags || []).some(tag =>
        keywords.includes(tag)
      )
    )
    .slice(0, 6)
})
</script>

<template>
  <div class="home-page">

    <!-- 페이지 상단 -->
    <div class="home-heading">
      <div class="heading-text">
        <h1>체리 디자인 아카이브</h1>
        <p>
          디자인팀의 모든 작업물을 한곳에서 모아보세요.
          아이디어가 더 멀리 나아갈 수 있도록, 차곡차곡 정리해요.
        </p>
      </div>

      <button
        class="new-folder-btn"
        type="button"
        @click="showFolderModal = true"
      >
        <span>＋</span>
        새 폴더 만들기
      </button>
    </div>

    <!-- 카테고리 필터 -->
    <div class="category-bar">
      <div class="category-list">
        <button
          v-for="category in categories"
          :key="category"
          class="category-btn"
          :class="{ active: selectedCategory === category }"
          @click="selectCategory(category)"
        >
          {{ category }}
        </button>
      </div>

      <!-- 갤러리 / 목록 보기 -->
      <div class="view-options">
        <button
          type="button"
          :class="{ 'view-active': viewMode === 'gallery' }"
          :aria-pressed="viewMode === 'gallery'"
          @click="changeViewMode('gallery')"
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
          갤러리 보기
        </button>

        <button
          type="button"
          :class="{ 'view-active': viewMode === 'list' }"
          :aria-pressed="viewMode === 'list'"
          @click="changeViewMode('list')"
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
          목록 보기
        </button>
      </div>
    </div>

    <!-- 팀 폴더 -->
    <section class="team-folders">
      <div class="section-heading">
        <div>
          <h2 class="folder-heading">
            📁 팀 폴더
            <span class="folder-count">
              {{ filteredFolders.length }}
            </span>
          </h2>
          <p>디자인팀에서 공유하는 폴더를 확인해보세요.</p>
        </div>

        <RouterLink to="/allfolders" class="view-all">
          전체보기
          <img
            :src="chevronRight"
            alt=""
            class="view-all-icon icon-off"
          />
          <img
            :src="chevronRightOn"
            alt=""
            class="view-all-icon icon-on"
          />
        </RouterLink>
      </div>

      <div
        class="folder-grid"
        :class="{ 'list-mode': viewMode === 'list' }"
      >
        <FolderCard
          v-for="folder in filteredFolders"
          :key="folder.id"
          :name="folder.name"
          :category="folder.category"
          :file-count="folder.fileCount"
          :updated-at="folder.updatedAt"
          :color="folder.color"
          :thumbnail="folder.thumbnail"
          @click="openFolder(folder)"
        />
      </div>

      <p
        v-if="filteredFolders.length === 0"
        class="empty-search"
      >
        일치하는 폴더가 없습니다.
      </p>
    </section>

    <!-- 최근 업로드 파일 / 전체 검색 결과 -->
    <section class="recent-assets">
      <div class="section-heading">
        <h2 class="asset-heading">
          {{
            searchQuery.trim()
              ? '🔍 전체 파일 검색 결과'
              : '🕒 최근 업로드 파일'
          }}

          <span class="folder-count">
            {{ filteredAssets.length }}
          </span>
        </h2>

        <RouterLink
          :to="searchQuery.trim() ? '/allfiles' : '/recentfiles'"
          class="view-all"
        >
          전체보기
          <img
            :src="chevronRight"
            alt=""
            class="view-all-icon icon-off"
          />
          <img
            :src="chevronRightOn"
            alt=""
            class="view-all-icon icon-on"
          />
        </RouterLink>
      </div>

      <div
        class="asset-grid"
        :class="{ 'list-mode': viewMode === 'list' }"
      >
        <!-- 검색 전: 기존 홈 카드 6개 -->
        <template v-if="!searchQuery.trim()">
          <AssetCard
  v-for="asset in filteredAssets"
  :key="asset.id"
  :file="asset"
  :title="asset.name"
  :thumbnail="asset.thumbnail"
  :tags="asset.tags"
  :updated-at="asset.uploadedAt"
/>
        </template>

        <!-- 검색 중: 전체 파일 검색 결과 -->
        <template v-else>
          <ArchiveFileCard
            v-for="asset in filteredAssets"
            :key="`${asset.folderId ?? 'home'}-${asset.id}`"
            :file="asset"
          />
        </template>
      </div>

      <p
        v-if="filteredAssets.length === 0"
        class="empty-search"
      >
        일치하는 파일이 없습니다.
      </p>
    </section>
    
<!-- 새 폴더 만들기 팝업 -->
<CreateFolderModal
  v-if="showFolderModal"
  @close="showFolderModal = false"
/>

  </div>
</template>

<style scoped>
.home-page {
  width: 100%;
}

/* 페이지 상단 */
.home-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 26px;
}

.heading-text h1 {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -1px;
  margin: 0 0 9px;
  color: #111;
}

.heading-text p {
  font-size: 15px;
  color: #7b89a5;
  margin: 0;
  line-height: 1.6;
}

.new-folder-btn {
  flex-shrink: 0;
  border: none;
  border-radius: 12px;
  background: #ff366b;
  color: white;
  padding: 15px 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.new-folder-btn span {
  font-size: 21px;
  vertical-align: -1px;
  margin-right: 8px;
}

/* 카테고리 */
.category-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-top: 25px;
  margin-bottom: 28px;
}

.category-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.category-btn {
  background: #f7f8fa;
  color: #7d89a2;
  border: 1px solid #f0f1f4;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 13px;
  cursor: pointer;
}

.category-btn.active {
  background: #ff4b7b;
  color: white;
  border-color: #ff4b7b;
}

/* 갤러리 / 목록 보기 */
.view-options {
  display: flex;
  gap: 5px;
  padding: 4px;
  border: 1px solid #e9ebf0;
  border-radius: 12px;
  white-space: nowrap;
}

.view-options button {
  border: none;
  background: transparent;
  padding: 9px 14px;
  border-radius: 9px;
  color: #7d89a2;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}

.view-options button:hover {
  color: #ff376b;
}

.view-options .view-active {
  background: #fff0f4;
  color: #ff376b;
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

.view-options button:not(.view-active):hover .icon-normal {
  display: none;
}

.view-options button:not(.view-active):hover .icon-hover {
  display: block;
}

@media (max-width: 1100px) {
  .home-heading,
  .category-bar {
    flex-wrap: wrap;
  }
}

/* 팀 폴더 */
.team-folders {
  margin-top: 36px;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-heading h2 {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 8px;
  color: #222;
}

.section-heading p {
  color: #919bad;
  font-size: 13px;
  margin: 0;
}

.view-all {
  color: #8994a8;
  text-decoration: none;
  font-size: 13px;
}

.view-all:hover {
  color: #ff366b;
}

.folder-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 1400px) {
  .folder-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .folder-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.folder-heading {
  display: flex;
  align-items: center;
  gap: 10px;
}

.folder-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  height: 28px;
  padding: 0 9px;
  background: #f1f3f7;
  color: #53647f;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

/* 최근 업로드 파일 */
.recent-assets {
  margin-top: 38px;
}

.asset-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.asset-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 16px;
  width: 100%;
}

@media (max-width: 1400px) {
  .asset-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 800px) {
  .asset-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* 목록 보기 */
.folder-grid.list-mode,
.asset-grid.list-mode {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 팀 폴더 목록 */
.folder-grid.list-mode :deep(.folder-card) {
  display: flex;
  align-items: center;
  min-height: 90px;
}

.folder-grid.list-mode :deep(.folder-thumbnail) {
  width: 160px;
  height: 90px;
  flex-shrink: 0;
}

.folder-grid.list-mode :deep(.folder-icon) {
  width: 45px;
  height: 45px;
}

.folder-grid.list-mode :deep(.folder-preview) {
  width: 85px;
  height: 65px;
}

.folder-grid.list-mode :deep(.folder-info) {
  flex: 1;
  min-width: 0;
  padding: 12px 20px;
}

/* 홈 기본 파일 목록 */
.asset-grid.list-mode :deep(.asset-card) {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 10px;
  border: 1px solid #edf0f5;
  border-radius: 12px;
}

.asset-grid.list-mode :deep(.asset-thumbnail) {
  width: 110px;
  height: 70px;
  aspect-ratio: auto;
  flex-shrink: 0;
}

.asset-grid.list-mode :deep(.asset-title) {
  flex: 1;
  min-width: 0;
  margin-top: 0;
}

.asset-grid.list-mode :deep(.asset-tags) {
  flex: 1;
  margin-top: 0;
}

.asset-grid.list-mode :deep(.asset-bottom) {
  min-width: 150px;
  margin-top: 0;
}

/* 전체 검색 결과 목록 */
.asset-grid.list-mode :deep(.file-card) {
  display: flex;
  align-items: center;
}

.asset-grid.list-mode :deep(.file-thumbnail) {
  width: 150px;
  height: 100px;
  flex-shrink: 0;
  aspect-ratio: auto;
}

.asset-grid.list-mode :deep(.file-card-content) {
  flex: 1;
  min-width: 0;
}

/* 새 폴더 만들기 팝업 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(22, 27, 40, 0.35);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.folder-modal {
  width: 440px;
  max-width: 100%;
  box-sizing: border-box;
  padding: 30px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(30, 40, 65, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 30px;
}

.modal-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: #202533;
  margin: 0 0 9px;
}

.modal-header p {
  font-size: 13px;
  line-height: 1.5;
  color: #8994aa;
  margin: 0;
}

.modal-close {
  flex-shrink: 0;
  border: none;
  background: #f6f7f9;
  color: #8590a5;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  font-size: 22px;
  cursor: pointer;
}

/* 폴더 입력 */
.modal-field {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
}

.modal-field label {
  color: #323b4e;
  font-size: 14px;
  font-weight: 600;
}

.modal-field input,
.modal-field select {
  width: 100%;
  box-sizing: border-box;
  height: 48px;
  padding: 0 15px;
  border: 1px solid #e5e9f0;
  border-radius: 11px;
  background: #fff;
  color: #30394a;
  font-size: 14px;
  outline: none;
}

.modal-field input:focus,
.modal-field select:focus {
  border-color: #ff4b7b;
  box-shadow: 0 0 0 3px #fff0f4;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #f0f1f5;
  padding-top: 22px;
  margin-top: 32px;
}

.cancel-btn,
.create-btn {
  border-radius: 10px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.cancel-btn {
  background: #f6f7f9;
  border: 1px solid #e9ebf0;
  color: #69778c;
}

.create-btn {
  background: #ff366b;
  border: 1px solid #ff366b;
  color: #fff;
}

.create-btn:hover {
  background: #ed275b;
}

.folder-error {
  color: #ff366b;
  font-size: 12px;
  margin: 0;
}

/* 폴더 색상 */
.folder-color-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.folder-color-option {
  width: 45px;
  height: 45px;
  border-radius: 12px;
  border: 2px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff366b;
  font-size: 18px;
  font-weight: 700;
  transition: 0.2s;
}

.folder-color-option:hover {
  transform: translateY(-2px);
}

.folder-color-option.selected {
  border-color: #ff366b;
  box-shadow: 0 0 0 3px #fff0f4;
}

/* 썸네일 업로드 */
.thumbnail-upload {
  border: 1px dashed #dce2eb;
  background: #fafbfc;
  border-radius: 12px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.thumbnail-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: #8591a5;
  font-size: 13px;
}

.upload-icon {
  font-size: 28px;
  color: #ff7296;
}

.thumbnail-placeholder small {
  color: #a0aabd;
  font-size: 11px;
}

.thumbnail-preview {
  width: 100%;
  max-width: 240px;
  height: 125px;
  object-fit: cover;
  border-radius: 10px;
}

.thumbnail-upload-button {
  background: white;
  border: 1px solid #e5e9f0;
  border-radius: 9px;
  padding: 10px 18px;
  color: #5b6880;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.thumbnail-upload-button:hover {
  border-color: #ff7296;
  color: #ff366b;
}

.thumbnail-upload-button input {
  display: none;
}

.thumbnail-remove {
  border: none;
  background: transparent;
  color: #ff366b;
  font-size: 12px;
  cursor: pointer;
}

.folder-modal {
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}

/* 전체보기 텍스트 / 화살표 */
.view-all {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.view-all-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
  flex-shrink: 0;
}

.view-all .icon-off {
  display: inline-block;
}

.view-all .icon-on {
  display: none;
}

.view-all:hover .icon-off {
  display: none;
}

.view-all:hover .icon-on {
  display: inline-block;
}

/* 검색 결과 없음 */
.empty-search {
  padding: 40px 20px;
  text-align: center;
  color: #8994a8;
  font-size: 14px;
}
</style>
