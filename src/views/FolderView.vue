
<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { folderList } from '../stores/folders'

const route = useRoute()

// 주소의 ID로 폴더 자동 찾기
const folder = computed(() => {
  return folderList.value.find(
    item => String(item.id) === String(route.params.id)
  )
})

// 임시 화면 확인용 파일 데이터
const demoFiles = [
  { id: 1, name: '체리 명함 시안 01', type: 'AI', size: '3.2MB', updatedAt: '2026.10.28', color: '#FFE8EF' },
  { id: 2, name: '체리 명함 시안 02', type: 'PSD', size: '8.4MB', updatedAt: '2026.10.27', color: '#FCE5F0' },
  { id: 3, name: '체리 명함 시안 03', type: 'PNG', size: '1.8MB', updatedAt: '2026.10.27', color: '#F7E9F2' },
  { id: 4, name: '명함 목업 이미지', type: 'JPG', size: '2.1MB', updatedAt: '2026.10.26', color: '#F4E9E6' },
  { id: 5, name: '로고 버전 명함', type: 'AI', size: '4.5MB', updatedAt: '2026.10.25', color: '#FBE6EE' },
  { id: 6, name: '명함 일러스트', type: 'AI', size: '3.7MB', updatedAt: '2026.10.24', color: '#EAF2FD' },
  { id: 7, name: '명함 배경 패턴', type: 'PNG', size: '1.3MB', updatedAt: '2026.10.23', color: '#F5E9FF' },
  { id: 8, name: '행사 명함', type: 'PDF', size: '2.6MB', updatedAt: '2026.10.22', color: '#FFF1DE' },
  { id: 9, name: '명함 시안 04', type: 'PSD', size: '5.2MB', updatedAt: '2026.10.21', color: '#E9F6EE' },
  { id: 10, name: '명함 시안 05', type: 'AI', size: '4.1MB', updatedAt: '2026.10.20', color: '#FFE7EB' },
  { id: 11, name: '명함 시안 06', type: 'PNG', size: '1.7MB', updatedAt: '2026.10.19', color: '#EEE8FA' },
  { id: 12, name: '명함 시안 07', type: 'JPG', size: '2.4MB', updatedAt: '2026.10.18', color: '#F8E8F0' }
]

// 폴더 내부 기능
const searchQuery = ref('')
const viewMode = ref('gallery')
const currentPage = ref(1)
const pageSize = 30

// 현재는 기존 예시 폴더인 '명함'에서만 임시 파일 표시
const files = computed(() => {
  return String(route.params.id) === '2' ? demoFiles : []
})

// 검색 기능
const filteredFiles = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) return files.value

  return files.value.filter(file =>
    file.name.toLowerCase().includes(query)
  )
})

// 페이지 개수
const totalPages = computed(() => {
  return Math.max(
    1,
    Math.ceil(filteredFiles.value.length / pageSize)
  )
})

// 현재 페이지 파일
const paginatedFiles = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredFiles.value.slice(start, start + pageSize)
})

// 검색어나 폴더 변경 시 첫 페이지
watch([searchQuery, () => route.params.id], () => {
  currentPage.value = 1
})

// 임시 관리자 표시 상태
// 실제 관리자 권한은 나중에 로그인 시스템에서 확인
const isAdmin = ref(false)
</script>

<template>
  <div class="folder-page">

    <template v-if="folder">

      <!-- 상단 경로 -->
      <div class="breadcrumb">
        <RouterLink to="/">홈</RouterLink>
        <span class="breadcrumb-arrow">›</span>
        <RouterLink to="/projects">팀 폴더</RouterLink>
        <span class="breadcrumb-arrow">›</span>
        <strong>{{ folder.name }}</strong>
      </div>

      
<!-- 폴더 상단 정보 -->
<div class="folder-header">

  <!-- 왼쪽: 폴더 정보 -->
  <div class="folder-heading-group">
    <div
      class="folder-icon-box"
      :style="{ backgroundColor: folder.color }"
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
      >
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10H3V7z" />
      </svg>
    </div>

    <div class="folder-heading-text">
      <h1>{{ folder.name }}</h1>
      <p>{{ folder.category }} · {{ files.length }}개 파일</p>
      <p class="folder-description">
        {{ folder.description || '디자인 자료를 모아둔 폴더입니다.' }}
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

    <!-- 갤러리 / 목록 -->
    <div class="view-options">
      <button
        type="button"
        :class="{ active: viewMode === 'gallery' }"
        @click="viewMode = 'gallery'"
      >
        ▦
      </button>

      <button
        type="button"
        :class="{ active: viewMode === 'list' }"
        @click="viewMode = 'list'"
      >
        ☷
      </button>
    </div>

    <!-- 모든 사용자에게 표시 -->
    <button type="button" class="upload-btn">
      <span>＋</span>
      파일 업로드
    </button>

    <!-- 관리자에게만 표시 -->
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


      <!-- 파일 목록 -->
      <section class="file-section">

        <div class="section-top">
  <div class="section-title">
    <h2>전체 파일</h2>
    <span class="file-count">{{ filteredFiles.length }}</span>
  </div>
</div>

        <!-- 파일 카드 -->
        <div
          v-if="paginatedFiles.length"
          class="file-grid"
          :class="{ 'list-mode': viewMode === 'list' }"
        >
          <div
            v-for="file in paginatedFiles"
            :key="file.id"
            class="file-card"
          >
            <div
              class="file-thumbnail"
              :style="{ backgroundColor: file.color }"
            >
              <div class="thumbnail-design">
                <span class="thumbnail-cherry">● ●</span>
                <span class="thumbnail-title">CHERRY</span>
                <span class="thumbnail-caption">DESIGN ARCHIVE</span>
              </div>

              <span class="file-extension">{{ file.type }}</span>
            </div>

            <div class="file-card-content">
              <div class="file-name-row">
                <h3 :title="file.name">{{ file.name }}</h3>
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

              <p class="file-date">
                수정 {{ file.updatedAt }}
              </p>
            </div>
          </div>
        </div>

        <!-- 빈 폴더 -->
        <div v-else class="empty-files">
          <div class="empty-icon">📂</div>

          <h3>
            {{ searchQuery ? '검색 결과가 없어요.' : '아직 등록된 파일이 없어요.' }}
          </h3>

          <p>
            {{ searchQuery
              ? '다른 검색어를 입력해보세요.'
              : '파일 업로드 버튼에서 디자인 자료를 추가할 수 있어요.'
            }}
          </p>
        </div>

        <!-- 하단 페이지 이동 -->
        <div
          v-if="filteredFiles.length > 0"
          class="pagination-area"
        >
          <span class="pagination-info">
            총 {{ filteredFiles.length }}개 중
            {{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, filteredFiles.length) }}개 표시
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
              :class="{ active: currentPage === page }"
              @click="currentPage = page"
            >
              {{ page }}
            </button>

            <button
              type="button"
              :disabled="currentPage === totalPages"
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
    </template>

    <!-- 존재하지 않는 폴더 -->
    <div v-else class="folder-not-found">
      <div class="empty-icon">📂</div>
      <h2>폴더를 찾을 수 없어요.</h2>
      <p>삭제되었거나 존재하지 않는 폴더예요.</p>
      <RouterLink to="/">홈으로 돌아가기</RouterLink>
    </div>

  </div>
</template>

<style scoped>
.folder-page {
  width: 100%;
  min-width: 0;
}

/* 상단 경로 */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 30px;
  font-size: 13px;
  color: #8c97a9;
}

.breadcrumb a {
  text-decoration: none;
  color: #8c97a9;
}

.breadcrumb a:hover {
  color: #ff366b;
}

.breadcrumb strong {
  font-weight: 600;
  color: #363f50;
}

.breadcrumb-arrow {
  color: #bec5d0;
  font-size: 18px;
}

/* 폴더 헤더 */
.folder-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 34px;
  flex-wrap: wrap;
}

.folder-heading-group {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.folder-icon-box {
  width: 64px;
  height: 64px;
  border-radius: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.folder-heading-text h1 {
  margin: 0 0 8px;
  font-size: 27px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #222936;
}

.folder-heading-text p {
  margin: 0;
  color: #8b96a9;
  font-size: 13px;
}

.info-dot {
  margin: 0 6px;
  color: #c3cad4;
}

.folder-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.folder-settings-btn {
  padding: 12px 18px;
  border: 1px solid #e9ecf2;
  border-radius: 10px;
  background: white;
  color: #68758a;
  font-size: 13px;
  cursor: pointer;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  border: none;
  background: #ff366b;
  color: #fff;
  border-radius: 11px;
  padding: 13px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.upload-btn:hover {
  background: #ed275b;
}

.upload-btn span {
  font-size: 20px;
  line-height: 1;
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
  font-size: 20px;
  font-weight: 700;
  color: #252c39;
  margin: 0;
}

.file-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  height: 28px;
  box-sizing: border-box;
  border-radius: 20px;
  padding: 0 9px;
  color: #53647f;
  background: #f1f3f7;
  font-size: 13px;
}

.file-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 220px;
  height: 40px;
  box-sizing: border-box;
  padding: 0 12px;
  border: 1px solid #e9ecf2;
  border-radius: 10px;
  background: #fff;
}

.search-icon {
  font-size: 23px;
  color: #a2aabc;
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
  border: 1px solid #e9ebf0;
  border-radius: 11px;
  white-space: nowrap;
}

.view-options button {
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #8190a8;
  font-size: 13px;
  cursor: pointer;
}

.view-options button.active {
  background: #fff0f4;
  color: #ff366b;
}

/* 5열 카드 */
.file-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
}

.file-card {
  min-width: 0;
  overflow: hidden;
  background: #fff;
  border: 1px solid #eceff4;
  border-radius: 13px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.file-card:hover {
  border-color: #ffc3d3;
  box-shadow: 0 5px 18px rgba(42, 51, 72, 0.06);
}

/* 컴팩트한 썸네일 */
.file-thumbnail {
  position: relative;
  aspect-ratio: 1.65 / 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.thumbnail-design {
  width: 70%;
  height: 57%;
  background: #fff;
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
  margin: 0;
  color: #30394a;
}

.file-more {
  flex-shrink: 0;
  border: none;
  background: transparent;
  color: #8f9aae;
  font-size: 18px;
  cursor: pointer;
  padding: 0 3px;
  line-height: 1;
}

.file-meta {
  margin: 9px 0 6px;
  color: #8c96a8;
  font-size: 12px;
}

.file-meta span {
  margin: 0 4px;
}

.file-date {
  margin: 0;
  color: #8994a8;
  font-size: 12px;
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
.file-grid.list-mode .file-date {
  margin: 0;
  white-space: nowrap;
}

/* 빈 폴더 */
.empty-files {
  min-height: 260px;
  padding: 55px 20px;
  box-sizing: border-box;
  background: #fff;
  border: 1px dashed #dce2eb;
  border-radius: 15px;
  text-align: center;
}

.empty-icon {
  font-size: 43px;
}

.empty-files h3 {
  margin: 14px 0 8px;
  font-size: 17px;
  color: #374052;
}

.empty-files p {
  font-size: 13px;
  color: #8994a8;
}

/* 페이지 이동 */
.pagination-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
  flex-wrap: wrap;
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
  background: #ff366b;
  border-color: #ff366b;
  color: #fff;
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 폴더 없음 */
.folder-not-found {
  padding: 80px 20px;
  text-align: center;
}

.folder-not-found h2 {
  margin: 16px 0 8px;
  color: #30394a;
}

.folder-not-found p {
  color: #8994a8;
  font-size: 13px;
  margin-bottom: 20px;
}

.folder-not-found a {
  display: inline-block;
  text-decoration: none;
  padding: 11px 18px;
  border-radius: 10px;
  background: #ff366b;
  color: white;
  font-size: 13px;
}

/* 화면 크기에 따라 조절 */
@media (max-width: 1300px) {
  .file-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
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

  .folder-header {
    align-items: flex-start;
  }

  .folder-heading-text h1 {
    font-size: 23px;
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

/* 폴더 정보와 버튼 한 줄 배치 */
.folder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.folder-heading-group {
  flex-shrink: 0;
}

.folder-header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: nowrap;
  min-width: 0;
}

/* 폴더 설명 */
.folder-description {
  margin-top: 6px !important;
  color: #8b96a9;
  font-size: 13px;
}

/* 검색창 크기 */
.folder-header-actions .search-box {
  width: 220px;
  flex-shrink: 1;
  min-width: 130px;
}

/* 갤러리 / 목록 버튼 */
.folder-header-actions .view-options {
  flex-shrink: 0;
}

/* 관리자 전용 점 세 개 */
.folder-header-actions .folder-settings-btn {
  width: 42px;
  height: 42px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e9ecf2;
  border-radius: 11px;
  background: #f7f8fb;
  color: #65718a;
  font-size: 22px;
  cursor: pointer;
  flex-shrink: 0;
}

.folder-header-actions .folder-settings-btn:hover {
  background: #fff0f4;
  color: #ff366b;
}

/* 좁은 화면에서는 버튼이 아래로 내려가도록 */
@media (max-width: 1150px) {
  .folder-header {
    flex-wrap: wrap;
  }

  .folder-header-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
