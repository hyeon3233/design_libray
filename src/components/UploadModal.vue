
<script setup>
import { ref, computed } from 'vue'

// 부모 화면에서 전달받는 업로드 대상 폴더
const props = defineProps({
  folder: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'upload'])

// 입력값
const title = ref('')
const description = ref('')
const selectedTags = ref([])

// 태그 드롭다운
const showTagDropdown = ref(false)

// 파일 선택
const fileInput = ref(null)
const folderInput = ref(null)

// 선택한 항목
const selectedItems = ref([])

// 상태 관리
const isDragging = ref(false)
const isReading = ref(false)
const errorMessage = ref('')

// 태그 목록
const availableTags = [
  '포토 프레임',
  'GUI·UI',
  '캐릭터',
  '포스터',
  '배너',
  '현수막',
  'SNS',
  '굿즈',
  '인쇄물',
  '명함',
  '디자인 소스',
  '로고',
  '이벤트',
  '프로모션',
  '기타'
]

// 파일 이름에서 확장자 제거
function removeExtension(name) {
  const index = name.lastIndexOf('.')

  if (index <= 0) return name

  return name.substring(0, index)
}

// 선택된 항목 개수
const selectedCount = computed(() =>
  selectedItems.value.length
)

// 선택된 실제 파일 개수
const totalFileCount = computed(() =>
  selectedItems.value.reduce(
    (total, item) => total + item.files.length,
    0
  )
)

// 선택된 폴더 개수
const totalFolderCount = computed(() =>
  selectedItems.value.filter(
    item => item.kind === 'folder'
  ).length
)

// 업로드 버튼 활성화 여부
const canUpload = computed(() =>
  title.value.trim().length > 0 &&
  selectedItems.value.length > 0 &&
  totalFileCount.value > 0 &&
  !isReading.value
)

// 고유 ID
let nextItemId = 0

function createItemId() {
  nextItemId += 1
  return `upload-${Date.now()}-${nextItemId}`
}

// 파일 크기 표시
function formatSize(bytes) {
  if (bytes < 1024) {
    return `${bytes}B`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)}KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

// 전체 파일 용량
const totalSize = computed(() => {
  const bytes = selectedItems.value.reduce(
    (total, item) =>
      total + item.files.reduce(
        (sum, entry) => sum + entry.file.size,
        0
      ),
    0
  )

  return formatSize(bytes)
})

// 태그 선택 / 해제
function toggleTag(tag) {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter(
      item => item !== tag
    )
  } else {
    selectedTags.value.push(tag)
  }
}

// 태그 제거
function removeTag(tag) {
  selectedTags.value = selectedTags.value.filter(
    item => item !== tag
  )
}

// 파일 선택창 열기
function openFilePicker() {
  fileInput.value?.click()
}

// 폴더 선택창 열기
function openFolderPicker() {
  folderInput.value?.click()
}

// 항목 목록에 추가
function addItems(items) {
  if (!items.length) return

  selectedItems.value.push(...items)

  // 제목이 비어 있으면 첫 항목 이름을 자동으로 입력
  if (!title.value.trim() && selectedItems.value.length) {
    const first = selectedItems.value[0]

    title.value = first.kind === 'folder'
      ? first.name
      : removeExtension(first.name)
  }

  errorMessage.value = ''
}

// 일반 파일 선택
function handleFileSelect(event) {
  const files = Array.from(event.target.files || [])

  const items = files.map(file => ({
    id: createItemId(),
    kind: 'file',
    name: file.name,
    files: [{
      file,
      relativePath: file.name
    }],
    folderPaths: []
  }))

  addItems(items)

  event.target.value = ''
}

// 폴더 경로 목록 생성
function getFolderPaths(paths) {
  const folders = new Set()

  paths.forEach(path => {
    const parts = path.split('/')

    // 마지막은 파일명이므로 제외
    for (let i = 1; i < parts.length; i++) {
      folders.add(parts.slice(0, i).join('/'))
    }
  })

  return [...folders]
}

// 폴더 선택
function handleFolderSelect(event) {
  const files = Array.from(event.target.files || [])

  if (!files.length) {
    event.target.value = ''
    return
  }

  // 최상위 폴더별로 묶기
  const groups = new Map()

  files.forEach(file => {
    const path = file.webkitRelativePath || file.name
    const rootName = path.split('/')[0]

    if (!groups.has(rootName)) {
      groups.set(rootName, [])
    }

    groups.get(rootName).push({
      file,
      relativePath: path
    })
  })

  const items = [...groups.entries()].map(
    ([name, entries]) => ({
      id: createItemId(),
      kind: 'folder',
      name,
      files: entries,
      folderPaths: getFolderPaths(
        entries.map(entry => entry.relativePath)
      )
    })
  )

  addItems(items)

  event.target.value = ''
}

// 드래그 앤 드롭
function handleDragOver(event) {
  event.preventDefault()
  isDragging.value = true
}

function handleDragLeave(event) {
  event.preventDefault()

  // 드롭 영역 바깥으로 나갔을 때만 해제
  if (!event.currentTarget.contains(event.relatedTarget)) {
    isDragging.value = false
  }
}

// 드롭된 파일 엔트리 읽기
function readFileEntry(entry) {
  return new Promise((resolve, reject) => {
    entry.file(resolve, reject)
  })
}

// 폴더 내부 엔트리 모두 읽기
function readDirectoryEntries(reader) {
  return new Promise(async (resolve, reject) => {
    const results = []

    try {
      while (true) {
        const batch = await new Promise(
          (done, fail) => reader.readEntries(done, fail)
        )

        if (!batch.length) break

        results.push(...batch)
      }

      resolve(results)
    } catch (error) {
      reject(error)
    }
  })
}

// 폴더 구조를 유지하면서 재귀 탐색
async function traverseEntry(
  entry,
  parentPath = ''
) {
  const currentPath = parentPath
    ? `${parentPath}/${entry.name}`
    : entry.name

  if (entry.isFile) {
    const file = await readFileEntry(entry)

    return {
      files: [{
        file,
        relativePath: currentPath
      }],
      folders: []
    }
  }

  if (entry.isDirectory) {
    const reader = entry.createReader()
    const children = await readDirectoryEntries(reader)

    const results = await Promise.all(
      children.map(child =>
        traverseEntry(child, currentPath)
      )
    )

    return {
      files: results.flatMap(result => result.files),
      folders: [
        currentPath,
        ...results.flatMap(result => result.folders)
      ]
    }
  }

  return {
    files: [],
    folders: []
  }
}

// 드롭 이벤트
async function handleDrop(event) {
  event.preventDefault()
  isDragging.value = false

  if (isReading.value) return

  isReading.value = true
  errorMessage.value = ''

  try {
    const dataItems = Array.from(
      event.dataTransfer?.items || []
    )

    const entries = dataItems
      .filter(item => item.kind === 'file')
      .map(item => item.webkitGetAsEntry?.())
      .filter(Boolean)

    let items = []

    if (entries.length) {
      const results = await Promise.all(
        entries.map(entry => traverseEntry(entry))
      )

      items = entries.map((entry, index) => ({
        id: createItemId(),
        kind: entry.isDirectory ? 'folder' : 'file',
        name: entry.name,
        files: results[index].files,
        folderPaths: results[index].folders
      }))
    } else {
      // 일반 파일 드롭을 지원하는 브라우저
      const files = Array.from(
        event.dataTransfer?.files || []
      )

      items = files.map(file => ({
        id: createItemId(),
        kind: 'file',
        name: file.name,
        files: [{
          file,
          relativePath: file.name
        }],
        folderPaths: []
      }))
    }

    addItems(items)
  } catch (error) {
    console.error('파일 읽기 실패:', error)

    errorMessage.value =
      '파일 또는 폴더를 불러오지 못했어요.'
  } finally {
    isReading.value = false
  }
}

// 항목 개별 삭제
function removeItem(id) {
  selectedItems.value = selectedItems.value.filter(
    item => item.id !== id
  )
}

// 전체 삭제
function clearItems() {
  selectedItems.value = []
}

// 닫기
function closeModal() {
  if (isReading.value) return

  emit('close')
}

// ESC 키
function handleKeydown(event) {
  if (event.key === 'Escape') {
    if (showTagDropdown.value) {
      showTagDropdown.value = false
    } else {
      closeModal()
    }
  }
}

// 업로드 요청
function submitUpload() {
  if (!title.value.trim()) {
    errorMessage.value = '제목을 입력해 주세요.'
    return
  }

  if (!selectedItems.value.length) {
    errorMessage.value =
      '업로드할 파일이나 폴더를 선택해 주세요.'
    return
  }

  if (!totalFileCount.value) {
    errorMessage.value =
      '업로드할 파일이 포함되어 있어야 해요.'
    return
  }

  // 실제 저장은 부모 화면에서 수행
  emit('upload', {
    title: title.value.trim(),
    tags: [...selectedTags.value],
    description: description.value.trim(),
    folderId: props.folder?.id ?? null,
    items: selectedItems.value.map(item => ({
      kind: item.kind,
      name: item.name,
      files: item.files,
      folderPaths: item.folderPaths
    })),
    files: selectedItems.value.flatMap(
      item => item.files
    ),
    folderPaths: [
      ...new Set(
        selectedItems.value.flatMap(
          item => item.folderPaths
        )
      )
    ]
  })
}
</script>

<template>
  <div
    class="upload-overlay"
    @click.self="closeModal"
    @keydown="handleKeydown"
  >
    <div
      class="upload-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      <!-- 상단 -->
      <div class="modal-header">
        <div>
          <h2 id="upload-modal-title">
            파일 업로드
          </h2>

          <p>
            파일이나 폴더를 업로드하여 디자인 자료를 추가해보세요.
          </p>
        </div>

        <button
          type="button"
          class="close-btn"
          aria-label="닫기"
          @click="closeModal"
        >
          ×
        </button>
      </div>

      <!-- 본문 -->
      <div class="modal-content">

        <!-- 왼쪽 정보 입력 -->
        <div class="info-column">

          <!-- 제목 -->
          <div class="form-field">
            <label for="upload-title">
              제목 <span class="required">*</span>
            </label>

            <input
              id="upload-title"
              v-model="title"
              type="text"
              maxlength="100"
              placeholder="예 : 프레임 디자인 자료"
            />
          </div>

          <!-- 태그 -->
          <div class="form-field tag-field">
            <label>태그</label>

            <p class="field-guide">
              관련 키워드를 태그로 추가하세요.
            </p>

            <div
              class="tag-select"
              :class="{ opened: showTagDropdown }"
            >
              <button
                type="button"
                class="tag-trigger"
                aria-label="태그 선택"
                :aria-expanded="showTagDropdown"
                @click="
                  showTagDropdown = !showTagDropdown
                "
              >
                <span class="selected-tags">
                  <span
                    v-for="tag in selectedTags"
                    :key="tag"
                    class="tag-chip"
                  >
                    {{ tag }}

                    <span
                      class="tag-remove"
                      role="button"
                      tabindex="0"
                      :aria-label="`${tag} 태그 제거`"
                      @click.stop="removeTag(tag)"
                      @keydown.enter.stop="
                        removeTag(tag)
                      "
                    >
                      ×
                    </span>
                  </span>

                  <span
                    v-if="selectedTags.length === 0"
                    class="tag-placeholder"
                  >
                    태그를 선택해 주세요.
                  </span>
                </span>

                <span class="dropdown-arrow">
                  {{ showTagDropdown ? '⌃' : '⌄' }}
                </span>
              </button>

              <!-- 태그 드롭다운 -->
              <div
                v-if="showTagDropdown"
                class="tag-dropdown"
              >
                <div class="tag-dropdown-title">
                  태그 선택
                  <span>
                    {{ selectedTags.length }}개 선택
                  </span>
                </div>

                <div class="tag-options">
                  <label
                    v-for="tag in availableTags"
                    :key="tag"
                    class="tag-option"
                  >
                    <input
                      type="checkbox"
                      :checked="
                        selectedTags.includes(tag)
                      "
                      @change="toggleTag(tag)"
                    />
                    <span>{{ tag }}</span>
                  </label>
                </div>

                <button
                  type="button"
                  class="tag-done"
                  @click="showTagDropdown = false"
                >
                  선택 완료
                </button>
              </div>
            </div>
          </div>

          <!-- 설명 -->
          <div class="form-field">
            <label for="upload-description">
              설명
            </label>

            <textarea
              id="upload-description"
              v-model="description"
              maxlength="200"
              placeholder="이 자료에 대한 간단한 설명을 입력해 주세요."
              rows="5"
            ></textarea>

            <span class="char-count">
              {{ description.length }}/200
            </span>
          </div>

        </div>

        <!-- 오른쪽 파일 업로드 -->
        <div class="upload-column">

          <!-- 드래그 앤 드롭 -->
          <div
            class="drop-zone"
            :class="{ dragging: isDragging }"
            @dragenter.prevent="isDragging = true"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
            @drop="handleDrop"
          >
            <div class="upload-icon">
              <svg
                width="66"
                height="66"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17 46H15C8 46 5 41 5 35C5 29 9 24 15 23C17 14 24 9 33 9C42 9 49 15 50 23C56 24 60 29 60 35C60 41 56 46 49 46H47"
                  stroke="currentColor"
                  stroke-width="4"
                  stroke-linecap="round"
                />
                <path
                  d="M32 53V28M23 37L32 28L41 37"
                  stroke="currentColor"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>

            <h3>
              {{
                isReading
                  ? '파일을 확인하고 있어요...'
                  : '파일이나 폴더를 끌어다 놓아주세요.'
              }}
            </h3>

            <p>
              여러 개의 파일 또는 폴더를 한 번에
              추가할 수 있어요.
            </p>

            <div class="picker-buttons">
              <button
                type="button"
                class="picker-btn"
                :disabled="isReading"
                @click="openFilePicker"
              >
                <span class="picker-icon">▤</span>
                파일 선택
              </button>

              <button
                type="button"
                class="picker-btn"
                :disabled="isReading"
                @click="openFolderPicker"
              >
                <span class="picker-icon">▱</span>
                폴더 선택
              </button>
            </div>

            <p class="drop-guide">
              PNG, JPG, WEBP, GIF, PSD, AI, PDF 등
              다양한 파일을 추가할 수 있어요.
            </p>

            <!-- 실제 파일 input -->
            <input
              ref="fileInput"
              type="file"
              multiple
              class="hidden-input"
              @change="handleFileSelect"
            />

            <!-- 실제 폴더 input -->
            <input
              ref="folderInput"
              type="file"
              webkitdirectory
              directory
              multiple
              class="hidden-input"
              @change="handleFolderSelect"
            />
          </div>

          <!-- 선택된 항목 -->
          <div class="selected-section">

            <div class="selected-heading">
              <div class="selected-title">
                <h3>선택된 항목</h3>

                <span class="item-count">
                  {{ selectedCount }}개
                </span>
              </div>

              <button
                v-if="selectedCount > 0"
                type="button"
                class="clear-btn"
                @click="clearItems"
              >
                ♧ 전체 삭제
              </button>
            </div>

            <!-- 선택 파일 통계 -->
            <div
              v-if="selectedCount > 0"
              class="selection-summary"
            >
              파일 {{ totalFileCount }}개
              <template v-if="totalFolderCount">
                · 폴더 {{ totalFolderCount }}개
              </template>
              · {{ totalSize }}
            </div>

            <!-- 목록 -->
            <div
              v-if="selectedCount > 0"
              class="selected-list"
            >
              <div
                v-for="item in selectedItems"
                :key="item.id"
                class="selected-item"
              >
                <div
                  class="item-icon"
                  :class="{
                    'folder-icon': item.kind === 'folder'
                  }"
                >
                  <span v-if="item.kind === 'folder'">
                    📁
                  </span>

                  <span v-else>
                    {{
                      item.name.split('.').pop().toUpperCase()
                        .slice(0, 4)
                    }}
                  </span>
                </div>

                <div class="item-info">
                  <strong :title="item.name">
                    {{ item.name }}
                  </strong>

                  <span v-if="item.kind === 'folder'">
                    하위 파일 {{ item.files.length }}개
                    · 폴더 {{ item.folderPaths.length }}개
                  </span>

                  <span v-else>
                    {{
                      formatSize(
                        item.files[0]?.file.size || 0
                      )
                    }}
                  </span>
                </div>

                <button
                  type="button"
                  class="remove-item"
                  :aria-label="`${item.name} 제거`"
                  @click="removeItem(item.id)"
                >
                  ×
                </button>
              </div>
            </div>

            <!-- 선택 전 -->
            <div
              v-else
              class="empty-selection"
            >
              선택된 파일이나 폴더가 없습니다.
            </div>

          </div>

        </div>
      </div>

      <!-- 오류 안내 -->
      <p
        v-if="errorMessage"
        class="error-message"
        role="alert"
      >
        {{ errorMessage }}
      </p>

      <!-- 하단 버튼 -->
      <div class="modal-footer">
        <button
          type="button"
          class="cancel-btn"
          @click="closeModal"
        >
          취소
        </button>

        <button
          type="button"
          class="submit-btn"
          :disabled="!canUpload"
          @click="submitUpload"
        >
          <span>⇧</span>
          업로드
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* 전체 모달 배경 */
.upload-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(20, 24, 36, 0.48);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
}

/* 중앙 모달 */
.upload-modal {
  width: 1080px;
  max-width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-sizing: border-box;
  background: #ffffff;
  border-radius: 30px;
  padding: 36px 44px 30px;
  box-shadow: 0 25px 75px rgba(20, 25, 40, 0.2);
  color: #202533;
}

/* 상단 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  padding-bottom: 28px;
  border-bottom: 1px solid #edf0f5;
}

.modal-header h2 {
  margin: 0 0 10px;
  font-size: 30px;
  font-weight: 800;
  color: #111111;
}

.modal-header p {
  margin: 0;
  color: #72809d;
  font-size: 15px;
}

.close-btn {
  width: 43px;
  height: 43px;
  flex-shrink: 0;
  border: none;
  border-radius: 50%;
  background: #e8e8eb;
  color: #111;
  font-size: 28px;
  cursor: pointer;
}

/* 두 개의 컬럼 */
.modal-content {
  display: grid;
  grid-template-columns: 0.85fr 1.15fr;
  gap: 24px;
  padding: 26px 0;
}

/* 왼쪽 */
.info-column {
  min-width: 0;
  padding-right: 24px;
  border-right: 1px solid #edf0f5;
}

.form-field {
  margin-bottom: 28px;
  position: relative;
}

.form-field label {
  display: block;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 700;
  color: #161c2b;
}

.required {
  color: #ff316a;
}

.field-guide {
  margin: -5px 0 12px;
  color: #8390aa;
  font-size: 13px;
}

.form-field input:not([type="checkbox"]),
.form-field textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #e1e6f0;
  border-radius: 14px;
  background: #fff;
  color: #273349;
  font: inherit;
  font-size: 14px;
  outline: none;
}

.form-field input:not([type="checkbox"]) {
  height: 55px;
  padding: 0 17px;
}

.form-field textarea {
  min-height: 140px;
  resize: vertical;
  padding: 16px 17px;
  line-height: 1.6;
}

.form-field input:focus,
.form-field textarea:focus {
  border-color: #ff4b7b;
  box-shadow: 0 0 0 3px #fff0f4;
}

.char-count {
  display: block;
  margin-top: 5px;
  color: #72809d;
  text-align: right;
  font-size: 12px;
}

/* 태그 선택 */
.tag-field {
  position: relative;
}

.tag-select {
  position: relative;
}

.tag-trigger {
  width: 100%;
  min-height: 55px;
  padding: 7px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: #fff;
  border: 1px solid #e1e6f0;
  border-radius: 14px;
  cursor: pointer;
  text-align: left;
}

.tag-select.opened .tag-trigger {
  border-color: #ff4b7b;
}

.selected-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
  min-width: 0;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 11px;
  background: #ffe9f0;
  border-radius: 22px;
  color: #ff316a;
  font-size: 13px;
  font-weight: 600;
}

.tag-remove {
  font-size: 19px;
  cursor: pointer;
  line-height: 1;
}

.tag-placeholder {
  padding: 0 5px;
  color: #9aa5b8;
  font-size: 13px;
}

.dropdown-arrow {
  font-size: 19px;
  flex-shrink: 0;
  color: #202533;
}

.tag-dropdown {
  position: absolute;
  top: calc(100% + 7px);
  left: 0;
  width: 100%;
  box-sizing: border-box;
  background: #fff;
  border: 1px solid #e3e7ef;
  border-radius: 14px;
  padding: 15px;
  z-index: 30;
  box-shadow: 0 12px 30px rgba(20, 30, 50, 0.12);
}

.tag-dropdown-title {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 12px;
}

.tag-dropdown-title span {
  color: #ff316a;
  font-weight: 500;
}

.tag-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  max-height: 195px;
  overflow-y: auto;
}

.tag-option {
  display: flex !important;
  align-items: center;
  gap: 7px;
  margin: 0 !important;
  font-size: 13px !important;
  font-weight: 400 !important;
  cursor: pointer;
}

.tag-option input {
  accent-color: #ff316a;
  width: 15px;
  height: 15px;
}

.tag-done {
  display: block;
  margin: 17px 0 0 auto;
  border: none;
  border-radius: 8px;
  background: #ff366b;
  color: #fff;
  padding: 9px 17px;
  font-size: 12px;
  cursor: pointer;
}

/* 오른쪽 */
.upload-column {
  min-width: 0;
}

/* 드래그 영역 */
.drop-zone {
  min-height: 260px;
  box-sizing: border-box;
  border: 2px dashed #ff658e;
  border-radius: 18px;
  background: #fff0f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  text-align: center;
  transition: 0.2s;
}

.drop-zone.dragging {
  background: #ffe0eb;
  border-color: #ff1761;
  transform: scale(1.01);
}

.upload-icon {
  display: flex;
  color: #ff1761;
  margin-bottom: 7px;
}

.drop-zone h3 {
  font-size: 17px;
  font-weight: 700;
  color: #151a29;
  margin: 5px 0 8px;
}

.drop-zone p {
  margin: 0;
  font-size: 13px;
  color: #687795;
}

.picker-buttons {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 14px;
  margin: 19px 0;
}

.picker-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 1px solid #dce2ef;
  border-radius: 12px;
  background: white;
  color: #202533;
  padding: 12px 19px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.picker-btn:hover {
  border-color: #ff316a;
  color: #ff316a;
}

.picker-icon {
  font-size: 22px;
  color: #ff316a;
  line-height: 1;
}

.drop-zone .drop-guide {
  font-size: 11px;
  line-height: 1.6;
}

.hidden-input {
  display: none;
}

/* 선택된 항목 */
.selected-section {
  margin-top: 24px;
}

.selected-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.selected-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.selected-title h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
}

.item-count {
  background: #ffe9f0;
  color: #ff316a;
  border-radius: 20px;
  padding: 5px 10px;
  font-size: 13px;
  font-weight: 600;
}

.clear-btn {
  border: none;
  background: transparent;
  color: #ff316a;
  font-size: 13px;
  cursor: pointer;
}

.selection-summary {
  color: #8994a8;
  font-size: 12px;
  margin-bottom: 8px;
}

.selected-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
  max-height: 240px;
  overflow-y: auto;
}

.selected-item {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 9px 13px;
  border: 1px solid #e4e8f1;
  border-radius: 13px;
  min-height: 55px;
  box-sizing: border-box;
}

.item-icon {
  width: 52px;
  height: 43px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: #fff0f4;
  color: #ff316a;
  font-size: 13px;
  font-weight: 700;
}

.item-icon.folder-icon {
  background: #fff7e8;
  font-size: 28px;
}

.item-info {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-info strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: #202533;
}

.item-info span {
  font-size: 11px;
  color: #7c89a3;
}

.remove-item {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  color: #202533;
  font-size: 23px;
  cursor: pointer;
}

.empty-selection {
  border: 1px dashed #e4e8f1;
  border-radius: 12px;
  padding: 30px 12px;
  text-align: center;
  color: #9aa5b8;
  font-size: 13px;
}

/* 오류 메시지 */
.error-message {
  color: #f03060;
  font-size: 13px;
  margin: 0 0 15px;
}

/* 하단 버튼 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  padding-top: 24px;
  border-top: 1px solid #edf0f5;
}

.cancel-btn,
.submit-btn {
  min-width: 100px;
  border: none;
  border-radius: 13px;
  padding: 14px 23px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.cancel-btn {
  background: #eceef4;
  color: #202533;
}

.submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  background: #ff0860;
  color: white;
}

.submit-btn span {
  font-size: 24px;
  line-height: 1;
}

.submit-btn:hover:not(:disabled) {
  background: #ed0053;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 반응형 */
@media (max-width: 800px) {
  .upload-modal {
    width: 100%;
    padding: 25px 22px;
    border-radius: 22px;
  }

  .modal-header h2 {
    font-size: 24px;
  }

  .modal-content {
    grid-template-columns: 1fr;
  }

  .info-column {
    padding-right: 0;
    border-right: none;
    border-bottom: 1px solid #edf0f5;
    padding-bottom: 10px;
  }
}

@media (max-width: 480px) {
  .upload-overlay {
    padding: 10px;
  }

  .upload-modal {
    max-height: 95vh;
    padding: 20px 16px;
    border-radius: 18px;
  }

  .modal-header h2 {
    font-size: 22px;
  }

  .drop-zone {
    min-height: 245px;
  }

  .picker-buttons {
    gap: 8px;
  }

  .picker-btn {
    padding: 10px 13px;
    font-size: 12px;
  }

  .modal-footer button {
    min-width: 85px;
    font-size: 14px;
  }
}
</style>
