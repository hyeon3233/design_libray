
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { folderList } from '../stores/folders'

import FolderCard from '../components/FolderCard.vue'
import CreateFolderModal from '../components/CreateFolderModal.vue'

const router = useRouter()

// 갤러리 / 목록 보기
const viewMode = ref('gallery')

// 새 폴더 만들기 팝업
const showFolderModal = ref(false)

// 폴더 클릭 시 상세 페이지 이동
function openFolder(folder) {
  router.push(`/folders/${folder.id}`)
}
</script>

<template>
  <div class="all-folders-page">

    <!-- 상단 제목 및 새 폴더 만들기 버튼 -->
    <div class="page-heading">
      <div class="heading-text">
        <h1>모든 폴더</h1>
        <p>디자인팀의 모든 폴더를 확인해보세요.</p>
      </div>

      <button
        type="button"
        class="new-folder-btn"
        @click="showFolderModal = true"
      >
        <span>＋</span>
        새 폴더 만들기
      </button>
    </div>

    <!-- 폴더 목록 상단 -->
    <div class="folder-toolbar">
      <div class="folder-heading">
        <h2>전체 폴더</h2>

        <span class="folder-count">
          {{ folderList.length }}
        </span>
      </div>

      <!-- 갤러리 / 목록 보기 -->
      <div class="view-options">
        <button
          type="button"
          :class="{ active: viewMode === 'gallery' }"
          :aria-pressed="viewMode === 'gallery'"
          @click="viewMode = 'gallery'"
        >
          갤러리 보기
        </button>

        <button
          type="button"
          :class="{ active: viewMode === 'list' }"
          :aria-pressed="viewMode === 'list'"
          @click="viewMode = 'list'"
        >
          목록 보기
        </button>
      </div>
    </div>

    <!-- 폴더 카드 -->
    <div
      v-if="folderList.length > 0"
      class="folder-grid"
      :class="{ 'list-mode': viewMode === 'list' }"
    >
      <FolderCard
        v-for="folder in folderList"
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

    <!-- 폴더가 없을 때 -->
    <div v-else class="empty-state">
      <p>등록된 폴더가 없습니다.</p>
      <span>새 폴더를 만들어 디자인 자료를 정리해보세요.</span>
    </div>

    <!-- 새 폴더 만들기 공통 팝업 -->
    <CreateFolderModal
      v-if="showFolderModal"
      @close="showFolderModal = false"
    />

  </div>
</template>

<style scoped>
.all-folders-page {
  width: 100%;
  min-width: 0;
}

/* 페이지 상단 */
.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 40px;
}

.heading-text h1 {
  font-size: 30px;
  font-weight: 700;
  color: #202533;
  margin: 0 0 12px;
}

.heading-text p {
  font-size: 15px;
  color: #8994a8;
  margin: 0;
}

/* 새 폴더 만들기 버튼 */
.new-folder-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-shrink: 0;
  border: none;
  border-radius: 12px;
  background: #ff366b;
  color: #fff;
  padding: 15px 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.new-folder-btn:hover {
  background: #ed275b;
}

.new-folder-btn span {
  font-size: 21px;
  line-height: 1;
}

/* 폴더 목록 상단 */
.folder-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
}

.folder-heading {
  display: flex;
  align-items: center;
  gap: 10px;
}

.folder-heading h2 {
  font-size: 20px;
  font-weight: 700;
  color: #202533;
  margin: 0;
}

/* 폴더 개수 */
.folder-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  height: 28px;
  padding: 0 9px;
  border-radius: 20px;
  background: #f1f3f7;
  color: #53647f;
  font-size: 13px;
  font-weight: 500;
}

/* 갤러리 / 목록 보기 */
.view-options {
  display: flex;
  gap: 6px;
  padding: 4px;
  border: 1px solid #e9ebf0;
  border-radius: 12px;
}

.view-options button {
  border: none;
  border-radius: 9px;
  background: transparent;
  padding: 10px 14px;
  color: #7d89a2;
  font-size: 13px;
  cursor: pointer;
}

.view-options button:hover {
  color: #ff376b;
}

.view-options button.active {
  background: #fff0f4;
  color: #ff376b;
}

/* 폴더 갤러리 */
.folder-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
}

.folder-grid > * {
  min-width: 0;
  cursor: pointer;
}

/* 폴더 목록 보기 */
.folder-grid.list-mode {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

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

/* 빈 폴더 안내 */
.empty-state {
  padding: 80px 20px;
  text-align: center;
  color: #8994a8;
}

.empty-state p {
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: 600;
  color: #53647f;
}

.empty-state span {
  font-size: 13px;
}

/* 반응형 */
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

@media (max-width: 600px) {
  .folder-grid {
    grid-template-columns: 1fr;
  }

  .page-heading {
    gap: 20px;
    margin-bottom: 30px;
  }

  .new-folder-btn {
    padding: 12px 18px;
  }
}
</style>
