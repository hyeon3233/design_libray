
<script setup>
import { computed, ref } from 'vue'
import { recentFiles } from '../stores/files'
import ArchiveFileCard from '../components/ArchiveFileCard.vue'

const localQuery = ref('')

const displayedFiles = computed(() => {
  const q = localQuery.value.trim().toLowerCase()

  return recentFiles.value.filter(file =>
    [file.name, ...(file.tags || [])]
      .some(value =>
        String(value).toLowerCase().includes(q)
      )
  )
})
</script>

<template>
  <main class="files-page">
    <div class="page-heading">
      <div>
        <h1>최근 업로드 파일</h1>
        <p>최근 업로드한 파일부터 확인해보세요.</p>
      </div>

      <input
        v-model="localQuery"
        type="search"
        placeholder="파일 검색"
        aria-label="파일 검색"
      />
    </div>

    <div class="section-heading">
      <h2>
        최근 업로드 파일
        <span class="count">
          {{ displayedFiles.length }}
        </span>
      </h2>
    </div>

    <div
      v-if="displayedFiles.length"
      class="file-grid"
    >
      <ArchiveFileCard
        v-for="file in displayedFiles"
        :key="`${file.folderId ?? 'home'}-${file.id}`"
        :file="file"
      />
    </div>

    <p v-else class="empty-state">
      일치하는 파일이 없습니다.
    </p>
  </main>
</template>

<style scoped>
.files-page {
  width: 100%;
  min-width: 0;
}

.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 36px;
}

h1 {
  font-size: 30px;
  color: #202533;
  margin: 0 0 12px;
}

p {
  color: #8994a8;
  margin: 0;
  font-size: 15px;
}

.page-heading input {
  min-width: 230px;
  max-width: 350px;
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e6e9f0;
  border-radius: 12px;
  outline: none;
}

.page-heading input:focus {
  border-color: #fa477e;
}

.section-heading {
  margin-bottom: 18px;
}

h2 {
  font-size: 20px;
  color: #202533;
  margin: 0;
}

.count {
  font-size: 13px;
  color: #70819b;
  padding: 5px 12px;
  border-radius: 30px;
  background: #f2f4f8;
  margin-left: 7px;
}

.file-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
}

.empty-state {
  padding: 60px 0;
  text-align: center;
}

@media (max-width: 1350px) {
  .file-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 850px) {
  .file-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 570px) {
  .file-grid {
    grid-template-columns: 1fr;
  }
}
</style>
