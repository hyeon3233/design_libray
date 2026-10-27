
<script setup>
import { ref, computed } from 'vue'
import FolderCard from '../components/FolderCard.vue'
import AssetCard from '../components/AssetCard.vue'

import sharedImg from '../assets/folders/shared.png'
import businessCardImg from '../assets/folders/business-card.png'
import appstoreImg from '../assets/folders/appstore.png'
import cherryQrImg from '../assets/folders/cherry-qr.png'
import cherryDesignImg from '../assets/folders/cherry-design.png'

import posterImg from '../assets/recent/poster.png'
import recentBusinessImg from '../assets/recent/business-card.png'
import recentAppstoreImg from '../assets/recent/appstore.png'
import bannerImg from '../assets/recent/banner.png'
import goodsImg from '../assets/recent/goods.png'
import snsImg from '../assets/recent/sns.png'

// 보기 방식
const viewMode = ref('gallery')

// 새 폴더 팝업
const showFolderModal = ref(false)
const newFolderName = ref('')
const newFolderCategory = ref('포토 프레임')
const folderError = ref('')
// 폴더 색상 5가지 (기존 폴더와 동일)
const folderColors = [
  { name: '블루', value: '#E9F2FF' },
  { name: '핑크', value: '#FFE9F0' },
  { name: '민트', value: '#E9F6EE' },
  { name: '옐로우', value: '#FFF5D9' },
  { name: '퍼플', value: '#F1EAFF' }
]

// 선택한 색상 및 썸네일
const newFolderColor = ref('#E9F2FF')
const newFolderThumbnail = ref('')

// 썸네일 이미지 업로드
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

// 선택한 썸네일 삭제
function removeFolderThumbnail() {
  newFolderThumbnail.value = ''
}

function changeViewMode(mode) {
  viewMode.value = mode
}

const folders = [
  {
    id: 1,
    name: '공유용',
    category: '기타',
    fileCount: 24,
    updatedAt: '2026.10.27',
    color: '#E9F2FF',
    thumbnail: sharedImg
  },
  {
    id: 2,
    name: '명함',
    category: '인쇄물',
    fileCount: 12,
    updatedAt: '2026.10.25',
    color: '#FFE9F0',
    thumbnail: businessCardImg
  },
  {
    id: 3,
    name: '앱스토어 이미지',
    category: 'GUI·UI',
    fileCount: 18,
    updatedAt: '2026.10.24',
    color: '#E9F6EE',
    thumbnail: appstoreImg
  },
  {
    id: 4,
    name: '체리 QR',
    category: '디자인 소스',
    fileCount: 8,
    updatedAt: '2026.10.22',
    color: '#FFF5D9',
    thumbnail: cherryQrImg
  },
  {
    id: 5,
    name: '기타 디자인',
    category: '기타',
    fileCount: 15,
    updatedAt: '2026.10.20',
    color: '#F1EAFF',
    thumbnail: cherryDesignImg
  }
]

// 화면에 표시할 폴더 목록
const folderList = ref([...folders])

// 폴더 생성하기
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
    name: name,
    category: newFolderCategory.value,
    fileCount: 0,
    updatedAt: today,
    color: newFolderColor.value,
    thumbnail: newFolderThumbnail.value
  })

  // 입력값 초기화
  newFolderName.value = ''
  newFolderCategory.value = '포토 프레임'
  newFolderColor.value = '#E9F2FF'
  newFolderThumbnail.value = ''
  folderError.value = ''
  showFolderModal.value = false
}

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

const recentAssets = [
  {
    id: 1,
    title: '브랜드 포스터',
    thumbnail: posterImg,
    tags: ['포스터', '브랜딩'],
    updatedAt: '2026.10.27'
  },
  {
    id: 2,
    title: '명함 디자인',
    thumbnail: recentBusinessImg,
    tags: ['명함', '인쇄물'],
    updatedAt: '2026.10.26'
  },
  {
    id: 3,
    title: '앱스토어 이미지',
    thumbnail: recentAppstoreImg,
    tags: ['GUI·UI'],
    updatedAt: '2026.10.25'
  },
  {
    id: 4,
    title: '프로모션 배너',
    thumbnail: bannerImg,
    tags: ['배너', '홍보물'],
    updatedAt: '2026.10.24'
  },
  {
    id: 5,
    title: '굿즈 디자인',
    thumbnail: goodsImg,
    tags: ['굿즈'],
    updatedAt: '2026.10.23'
  },
  {
    id: 6,
    title: 'SNS 카드뉴스',
    thumbnail: snsImg,
    tags: ['SNS', '카드뉴스'],
    updatedAt: '2026.10.22'
  }
]
// 카테고리 이름 통일
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

// 선택한 카테고리의 폴더만 표시
const filteredFolders = computed(() => {
  if (selectedCategory.value === '전체') {
    return folderList.value
  }

  const keywords = categoryAliases[selectedCategory.value] || []

  return folderList.value.filter(folder =>
    keywords.includes(folder.category)
  )
})

// 선택한 카테고리의 파일만 표시
const filteredAssets = computed(() => {
  if (selectedCategory.value === '전체') {
    return recentAssets
  }

  const keywords = categoryAliases[selectedCategory.value] || []

  return recentAssets.filter(asset =>
    asset.tags.some(tag => keywords.includes(tag))
  )
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

      <!-- 보기 방식 -->
      <div class="view-options">
        <button
          type="button"
          :class="{ 'view-active': viewMode === 'gallery' }"
          :aria-pressed="viewMode === 'gallery'"
          @click="changeViewMode('gallery')"
        >
          ▦ 갤러리 보기
        </button>

        <button
          type="button"
          :class="{ 'view-active': viewMode === 'list' }"
          :aria-pressed="viewMode === 'list'"
          @click="changeViewMode('list')"
        >
          ☷ 목록 보기
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

        <RouterLink to="/categories" class="view-all">
          전체보기 →
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
        />
      </div>
    </section>

    <!-- 최근 업로드 파일 -->
    <section class="recent-assets">
      <div class="section-heading">
        <h2 class="asset-heading">
          🕒 최근 업로드 파일
          <span class="folder-count">
            {{ filteredAssets.length }}
          </span>
        </h2>

        <RouterLink to="/projects" class="view-all">
          전체보기 →
        </RouterLink>
      </div>

      <div
        class="asset-grid"
        :class="{ 'list-mode': viewMode === 'list' }"
      >
        <AssetCard
          v-for="asset in filteredAssets"
          :key="asset.id"
          :title="asset.title"
          :thumbnail="asset.thumbnail"
          :tags="asset.tags"
          :updated-at="asset.updatedAt"
        />
      </div>
    </section>

    <!-- 새 폴더 만들기 팝업 -->
    <div
      v-if="showFolderModal"
      class="modal-overlay"
      @click.self="showFolderModal = false"
    >
      <div
        class="folder-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="folder-modal-title"
      >

        <!-- 팝업 상단 -->
        <div class="modal-header">
          <div>
            <h2 id="folder-modal-title">새 폴더 만들기</h2>
            <p>디자인 자료를 정리할 새 폴더를 만들어보세요.</p>
          </div>

          <button
            type="button"
            class="modal-close"
            aria-label="닫기"
            @click="showFolderModal = false"
          >
            ×
          </button>
        </div>

        <!-- 폴더 이름 -->
        <div class="modal-field">
          <label for="folder-name">폴더 이름</label>

            <input
               id="folder-name"
                  v-model="newFolderName"
                  type="text"
                 placeholder="예: 2026 포토프레임"
                  maxlength="50"
                 @input="folderError = ''"
             />

  <p v-if="folderError" class="folder-error">
    {{ folderError }}
  </p>
</div>

        <!-- 카테고리 -->
        <div class="modal-field">
  <label for="folder-category">카테고리</label>

  <select
    id="folder-category"
    v-model="newFolderCategory"
  >
    <option
      v-for="category in categories.filter(c => c !== '전체')"
      :key="category"
      :value="category"
    >
      {{ category }}
    </option>
  </select>
</div>

<!-- 폴더 색상 -->
<div class="modal-field">
  <label>폴더 색상</label>

  <div class="folder-color-options">
    <button
      v-for="color in folderColors"
      :key="color.value"
      type="button"
      class="folder-color-option"
      :class="{ selected: newFolderColor === color.value }"
      :style="{ backgroundColor: color.value }"
      :title="color.name"
      :aria-label="color.name"
      :aria-pressed="newFolderColor === color.value"
      @click="newFolderColor = color.value"
    >
      <span v-if="newFolderColor === color.value">✓</span>
    </button>
  </div>
</div>

<!-- 썸네일 선택 -->
<div class="modal-field">
  <label>폴더 썸네일</label>

  <div class="thumbnail-upload">
    <img
      v-if="newFolderThumbnail"
      :src="newFolderThumbnail"
      class="thumbnail-preview"
      alt="선택한 폴더 썸네일"
    />

    <div v-else class="thumbnail-placeholder">
      <span class="upload-icon">＋</span>
      <span>대표 이미지 선택</span>
      <small>PNG, JPG, WEBP · 최대 5MB</small>
    </div>

    <label class="thumbnail-upload-button">
      이미지 선택
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        @change="uploadFolderThumbnail"
      />
    </label>

    <button
      v-if="newFolderThumbnail"
      type="button"
      class="thumbnail-remove"
      @click="removeFolderThumbnail"
    >
      이미지 삭제
    </button>
  </div>
</div>

        <!-- 하단 버튼 -->
        <div class="modal-actions">
          <button
            type="button"
            class="cancel-btn"
            @click="showFolderModal = false"
          >
            취소
          </button>

          <button
  type="button"
  class="create-btn"
  @click="createFolder"
>
  폴더 생성
</button>
        </div>

      </div>
    </div>

  </div>
</template>

<style scoped>
.home-page {
  width: 100%;
}

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
}

.view-options .view-active {
  background: #fff0f4;
  color: #ff376b;
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

/* 팀 폴더 제목 */
.folder-heading {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 폴더 개수 배지 */
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

/* ============================ */
/* 목록 보기 스타일 */
/* ============================ */

.folder-grid.list-mode,
.asset-grid.list-mode {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 팀 폴더 목록 형태 */
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

/* 최근 업로드 파일 목록 형태 */
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

/* ============================ */
/* 새 폴더 만들기 팝업 */
/* ============================ */

/* 팝업 뒷배경 */
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

/* 팝업 흰색 박스 */
.folder-modal {
  width: 440px;
  max-width: 100%;
  box-sizing: border-box;
  padding: 30px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(30, 40, 65, 0.15);
}

/* 팝업 상단 */
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

/* 입력 영역 */
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

/* 하단 버튼 */
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

/* 폴더 이름 입력 오류 */
.folder-error {
  color: #ff366b;
  font-size: 12px;
  margin: 0;
}


/* 폴더 색상 선택 */
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

/* 팝업 높이가 길어질 때 스크롤 */
.folder-modal {
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}

</style>
