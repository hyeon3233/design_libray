
<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { folderList } from '../stores/folders'

// 부모 컴포넌트에 전달할 이벤트
const emit = defineEmits(['close', 'created'])

// 입력값
const newFolderName = ref('')
const newFolderCategory = ref('포토 프레임')
const newFolderDescription = ref('')
const newFolderColor = ref('#E9F2FF')
const newFolderThumbnail = ref('')
const folderError = ref('')

// 입력창 참조
const nameInput = ref(null)
const imageInput = ref(null)

// 카테고리 목록 (기존 유지)
const categories = [
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

// 폴더 색상 (기존 색상 그대로 유지)
const folderColors = [
  { name: '블루', value: '#E9F2FF' },
  { name: '핑크', value: '#FFE9F0' },
  { name: '민트', value: '#E9F6EE' },
  { name: '옐로우', value: '#FFF5D9' },
  { name: '퍼플', value: '#F1EAFF' }
]

// 미리보기용 폴더 이름
const previewName = computed(() =>
  newFolderName.value.trim() || '새 폴더'
)

// 미리보기용 카테고리
const previewCategory = computed(() =>
  newFolderCategory.value
)

// 미리보기용 날짜
const previewDate = computed(() => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}.${month}.${day}`
})

// 폴더 기본 색상에 맞는 아이콘 색상
const previewIconColor = computed(() => {
  const colorMap = {
    '#E9F2FF': '#FF5790',
    '#FFE9F0': '#FF5790',
    '#E9F6EE': '#FF5790',
    '#FFF5D9': '#FF5790',
    '#F1EAFF': '#FF5790'
  }

  return colorMap[newFolderColor.value] || '#FF5790'
})

// 이미지 선택창 열기
function openImagePicker() {
  imageInput.value?.click()
}

// 이미지 파일 검사 및 적용
function applyThumbnailFile(file) {
  if (!file) return

  const allowedTypes = [
    'image/png',
    'image/jpeg',
    'image/webp'
  ]

  if (!allowedTypes.includes(file.type)) {
    alert('PNG, JPG, WEBP 이미지만 업로드할 수 있어요.')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('이미지는 5MB 이하로 선택해주세요.')
    return
  }

  const reader = new FileReader()

  reader.onload = () => {
    if (typeof reader.result === 'string') {
      newFolderThumbnail.value = reader.result
    }
  }

  reader.onerror = () => {
    alert('이미지를 불러오지 못했어요.')
  }

  reader.readAsDataURL(file)
}

// 이미지 선택
function uploadFolderThumbnail(event) {
  const file = event.target.files?.[0]

  applyThumbnailFile(file)

  event.target.value = ''
}

// 이미지 드래그 앤 드롭
const isDragging = ref(false)

function handleDragOver(event) {
  event.preventDefault()
  isDragging.value = true
}

function handleDragLeave(event) {
  event.preventDefault()

  if (!event.currentTarget.contains(event.relatedTarget)) {
    isDragging.value = false
  }
}

function handleImageDrop(event) {
  event.preventDefault()

  isDragging.value = false

  const file = event.dataTransfer?.files?.[0]

  applyThumbnailFile(file)
}

// 썸네일 삭제
function removeFolderThumbnail() {
  newFolderThumbnail.value = ''

  if (imageInput.value) {
    imageInput.value.value = ''
  }
}

// 폴더 생성
function createFolder() {
  const name = newFolderName.value.trim()

  // 폴더 이름 필수 입력
  if (!name) {
    folderError.value = '폴더 이름을 입력해주세요.'
    nameInput.value?.focus()
    return
  }

  // 기존 폴더 이름 중복 검사
  const duplicate = folderList.value.some(
    folder =>
      String(folder.name).trim().toLowerCase() ===
      name.toLowerCase()
  )

  if (duplicate) {
    folderError.value = '이미 같은 이름의 폴더가 있어요.'
    nameInput.value?.focus()
    return
  }

  // 현재 날짜
  const today = previewDate.value

  // 새 폴더 데이터
  const newFolder = {
    id: Date.now(),
    name: name,
    category: newFolderCategory.value,
    description: newFolderDescription.value.trim(),
    fileCount: 0,
    updatedAt: today,
    color: newFolderColor.value,
    thumbnail: newFolderThumbnail.value
  }

  // 공통 폴더 목록에 추가
  folderList.value.push(newFolder)

  // 생성 완료 이벤트
  emit('created', newFolder)

  // 모달 닫기
  emit('close')
}

// 닫기
function closeModal() {
  emit('close')
}

// ESC 키
function handleKeydown(event) {
  if (event.key === 'Escape') {
    closeModal()
  }
}

// 모달이 열리면 폴더 이름에 포커스
onMounted(async () => {
  await nextTick()
  nameInput.value?.focus()
})
</script>

<template>
  <div
    class="modal-overlay"
    @click.self="closeModal"
    @keydown="handleKeydown"
  >
    <div
      class="folder-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="folder-modal-title"
    >
      <!-- 상단 헤더 -->
      <div class="modal-header">
        <div class="header-text">
          <h2 id="folder-modal-title">
            새 폴더 만들기
          </h2>

          <p>
            디자인 자료를 정리할 새 폴더를 만들어보세요.
          </p>
        </div>

        <button
          type="button"
          class="modal-close"
          aria-label="닫기"
          @click="closeModal"
        >
          ×
        </button>
      </div>

      <!-- 폴더 생성 폼 -->
      <form @submit.prevent="createFolder">

        <!-- 좌우 2열 레이아웃 -->
        <div class="modal-content">

          <!-- 왼쪽 : 폴더 정보 -->
          <div class="info-column">

            <!-- 폴더 이름 -->
            <div class="modal-field">
              <label for="folder-name">
                폴더 이름
                <span class="required">*</span>
              </label>

              <input
                id="folder-name"
                ref="nameInput"
                v-model="newFolderName"
                type="text"
                placeholder="예 : 2026 포토프레임"
                maxlength="50"
                @input="folderError = ''"
              />

              <p
                v-if="folderError"
                class="folder-error"
                role="alert"
              >
                {{ folderError }}
              </p>
            </div>

            <!-- 카테고리 -->
            <div class="modal-field">
              <label for="folder-category">
                카테고리
              </label>

              <select
                id="folder-category"
                v-model="newFolderCategory"
              >
                <option
                  v-for="category in categories"
                  :key="category"
                  :value="category"
                >
                  {{ category }}
                </option>
              </select>
            </div>

            <!-- 폴더 설명 -->
            <div class="modal-field">
              <label for="folder-description">
                폴더 설명
                <span class="optional-label">
                  (선택)
                </span>
              </label>

              <textarea
                id="folder-description"
                v-model="newFolderDescription"
                placeholder="이 폴더에 어떤 디자인 자료를 모아둘지 설명해 주세요."
                maxlength="200"
                rows="5"
              ></textarea>

              <span class="description-count">
                {{ newFolderDescription.length }}/200
              </span>
            </div>

            <!-- 폴더 색상 -->
            <div class="modal-field color-field">
              <label>폴더 색상</label>

              <div class="folder-color-options">
                <button
                  v-for="color in folderColors"
                  :key="color.value"
                  type="button"
                  class="folder-color-option"
                  :class="{
                    selected: newFolderColor === color.value
                  }"
                  :style="{
                    backgroundColor: color.value
                  }"
                  :title="color.name"
                  :aria-label="color.name"
                  :aria-pressed="newFolderColor === color.value"
                  @click="newFolderColor = color.value"
                >
                  <svg
                    v-if="newFolderColor === color.value"
                    width="25"
                    height="25"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 12L9.5 17.5L20 6"
                      stroke="#FF366B"
                      stroke-width="2.4"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

          </div>

          <!-- 오른쪽 : 썸네일 및 미리보기 -->
          <div class="preview-column">

            <!-- 이미지 업로드 영역 -->
            <div
              class="thumbnail-upload"
              :class="{ dragging: isDragging }"
              @dragenter.prevent="isDragging = true"
              @dragover="handleDragOver"
              @dragleave="handleDragLeave"
              @drop="handleImageDrop"
            >
              <!-- 이미지가 선택되어 있는 경우 -->
              <template v-if="newFolderThumbnail">
                <img
                  :src="newFolderThumbnail"
                  alt="선택한 대표 이미지"
                  class="selected-thumbnail"
                />

                <div class="thumbnail-actions">
                  <button
                    type="button"
                    class="image-action-btn"
                    @click="openImagePicker"
                  >
                    이미지 변경
                  </button>

                  <button
                    type="button"
                    class="image-action-btn remove-btn"
                    @click="removeFolderThumbnail"
                  >
                    이미지 삭제
                  </button>
                </div>
              </template>

              <!-- 이미지 선택 전 -->
              <template v-else>
                <div class="upload-symbol">
                  <svg
                    width="60"
                    height="60"
                    viewBox="0 0 64 64"
                    fill="none"
                    aria-hidden="true"
                  >
                    <rect
                      x="9"
                      y="11"
                      width="46"
                      height="42"
                      rx="5"
                      stroke="currentColor"
                      stroke-width="3"
                    />
                    <path
                      d="M14 43L25 31L33 39L40 32L50 43"
                      stroke="currentColor"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <circle
                      cx="41"
                      cy="23"
                      r="5"
                      stroke="currentColor"
                      stroke-width="3"
                    />
                    <circle
                      cx="50"
                      cy="49"
                      r="12"
                      fill="#FF366B"
                      stroke="#FFF0F5"
                      stroke-width="3"
                    />
                    <path
                      d="M50 43V55M44 49H56"
                      stroke="white"
                      stroke-width="2.5"
                      stroke-linecap="round"
                    />
                  </svg>
                </div>

                <h3>대표 이미지 선택</h3>

                <p>
                  PNG, JPG, WEBP · 최대 5MB
                </p>

                <button
                  type="button"
                  class="image-select-btn"
                  @click="openImagePicker"
                >
                  이미지 선택
                </button>
              </template>

              <!-- 숨겨진 파일 입력 -->
              <input
                ref="imageInput"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                class="hidden-file-input"
                @change="uploadFolderThumbnail"
              />
            </div>

            <!-- 실제 폴더 카드 미리보기 -->
            <div class="preview-section">
              <h3 class="preview-heading">
                미리보기
              </h3>

              <div class="preview-card">

                <!-- 카드 썸네일 영역 -->
                <div
                  class="preview-card-top"
                  :style="{
                    backgroundColor: newFolderColor
                  }"
                >
                  <!-- 폴더 아이콘 -->
                  <div class="preview-folder-icon">
                    <svg
                      width="66"
                      height="58"
                      viewBox="0 0 66 58"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M7 12C7 9.2 9.2 7 12 7H27L33 14H54C57 14 59 16 59 19V46C59 49 57 51 54 51H12C9 51 7 49 7 46V12Z"
                        :fill="previewIconColor"
                        fill-opacity="0.65"
                      />
                      <path
                        d="M7 22C7 19 9 17 12 17H56C59 17 61 19 61 22V47C61 50 59 52 56 52H12C9 52 7 50 7 47V22Z"
                        :fill="previewIconColor"
                      />
                    </svg>
                  </div>

                  <!-- 대표 이미지 미리보기 -->
                  <div class="preview-image-area">
                    <img
                      v-if="newFolderThumbnail"
                      :src="newFolderThumbnail"
                      alt="폴더 대표 이미지 미리보기"
                    />

                    <div
                      v-else
                      class="default-preview-image"
                    >
                      <span class="default-logo-mark">
                        ● ●
                      </span>
                      <strong>CHERRY</strong>
                      <small>DESIGN ARCHIVE</small>
                    </div>
                  </div>
                </div>

                <!-- 카드 정보 -->
                <div class="preview-card-body">
                  <div class="preview-name-row">
                    <strong :title="previewName">
                      {{ previewName }}
                    </strong>

                    <span class="preview-more">
                      ···
                    </span>
                  </div>

                  <span class="preview-category">
                    {{ previewCategory }}
                  </span>

                  <div class="preview-card-bottom">
                    <span>0개 파일</span>
                    <span>{{ previewDate }}</span>
                  </div>
                </div>
              </div>

              <p class="preview-guide">
                입력한 내용이 실제 폴더 카드에 반영됩니다.
              </p>
            </div>
          </div>
        </div>

        <!-- 하단 버튼 -->
        <div class="modal-actions">
          <button
            type="button"
            class="cancel-btn"
            @click="closeModal"
          >
            취소
          </button>

          <button
            type="submit"
            class="create-btn"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 7C3 5.9 3.9 5 5 5H10L12 8H19C20.1 8 21 8.9 21 10V19H3V7Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linejoin="round"
              />
              <path
                d="M16 13V19M13 16H19"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>

            폴더 생성
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<style scoped>
/* 모달 오버레이 */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  background: rgba(20, 24, 36, 0.46);
  backdrop-filter: blur(2px);
}

/* 중앙 대형 모달 */
.folder-modal {
  width: 1080px;
  max-width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 36px 44px 30px;
  background: #ffffff;
  border-radius: 30px;
  box-shadow: 0 25px 75px rgba(20, 25, 40, 0.2);
  color: #202533;
}

/* 상단 헤더 */
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
  line-height: 1.5;
}

.modal-close {
  width: 43px;
  height: 43px;
  flex-shrink: 0;
  border: none;
  border-radius: 50%;
  background: #e8e8eb;
  color: #111111;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
}

.modal-close:hover {
  background: #dcdde3;
}

/* 좌우 2열 */
.modal-content {
  display: grid;
  grid-template-columns: 0.85fr 1.15fr;
  gap: 24px;
  padding: 28px 0;
}

/* 왼쪽 정보 영역 */
.info-column {
  min-width: 0;
  padding-right: 24px;
  border-right: 1px solid #edf0f5;
}

/* 입력 항목 */
.modal-field {
  display: flex;
  flex-direction: column;
  gap: 11px;
  margin-bottom: 28px;
}

.modal-field label {
  font-size: 16px;
  font-weight: 700;
  color: #161c2b;
}

.required {
  color: #ff316a;
}

.optional-label {
  margin-left: 4px;
  color: #8390aa;
  font-size: 12px;
  font-weight: 400;
}

.modal-field input,
.modal-field select,
.modal-field textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #e1e6f0;
  border-radius: 14px;
  background: #ffffff;
  color: #273349;
  font-family: inherit;
  font-size: 14px;
  outline: none;
}

.modal-field input,
.modal-field select {
  height: 55px;
  padding: 0 17px;
}

.modal-field textarea {
  min-height: 140px;
  padding: 16px 17px;
  line-height: 1.6;
  resize: vertical;
}

.modal-field input:focus,
.modal-field select:focus,
.modal-field textarea:focus {
  border-color: #ff4b7b;
  box-shadow: 0 0 0 3px #fff0f4;
}

.modal-field input::placeholder,
.modal-field textarea::placeholder {
  color: #8994aa;
}

.description-count {
  align-self: flex-end;
  margin-top: -5px;
  color: #72809d;
  font-size: 12px;
}

.folder-error {
  margin: 0;
  color: #ff366b;
  font-size: 12px;
}

/* 폴더 색상 */
.color-field {
  margin-bottom: 0;
}

.folder-color-options {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  padding-top: 7px;
}

.folder-color-option {
  width: 49px;
  height: 49px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s;
}

.folder-color-option:hover {
  transform: translateY(-2px);
}

.folder-color-option.selected {
  border-color: #ff366b;
  box-shadow: 0 0 0 2px #fff0f4;
}

/* 오른쪽 영역 */
.preview-column {
  min-width: 0;
}

/* 이미지 업로드 영역 */
.thumbnail-upload {
  width: 100%;
  height: 270px;
  box-sizing: border-box;
  border: 2px dashed #ff658e;
  border-radius: 18px;
  background: #fff0f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
  overflow: hidden;
  transition: background 0.2s;
}

.thumbnail-upload.dragging {
  background: #ffe0eb;
  border-color: #ff1761;
}

.upload-symbol {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff1761;
  margin-bottom: 8px;
}

.thumbnail-upload h3 {
  margin: 6px 0 8px;
  color: #171c2b;
  font-size: 17px;
  font-weight: 700;
}

.thumbnail-upload p {
  margin: 0;
  color: #687795;
  font-size: 13px;
}

.image-select-btn,
.image-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  padding: 12px 21px;
  border: 1px solid #dce2ef;
  border-radius: 12px;
  background: #ffffff;
  color: #202533;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.image-select-btn:hover,
.image-action-btn:hover {
  border-color: #ff366b;
  color: #ff366b;
}

.hidden-file-input {
  display: none;
}

/* 선택된 이미지 */
.selected-thumbnail {
  width: 100%;
  max-width: 280px;
  height: 155px;
  border-radius: 10px;
  object-fit: contain;
}

.thumbnail-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
}

.image-action-btn {
  margin-top: 12px;
  padding: 10px 15px;
  font-size: 12px;
}

.remove-btn {
  color: #ff366b;
}

/* 미리보기 영역 */
.preview-section {
  margin-top: 25px;
}

.preview-heading {
  margin: 0 0 15px;
  color: #171c2b;
  font-size: 18px;
  font-weight: 700;
}

/* 폴더 카드 미리보기 */
.preview-card {
  width: 285px;
  max-width: 100%;
  margin: 0 auto;
  background: #ffffff;
  border: 1px solid #e4e8f1;
  border-radius: 13px;
  overflow: hidden;
  box-sizing: border-box;
}

/* 폴더 카드 이미지 영역 */
.preview-card-top {
  height: 155px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 15px;
  box-sizing: border-box;
  gap: 12px;
}

.preview-folder-icon {
  width: 80px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image-area {
  flex: 1;
  height: 105px;
  min-width: 0;
  border-radius: 7px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 3px 10px rgba(50, 50, 70, 0.08);
}

.preview-image-area img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 이미지가 없을 때 기본 미리보기 */
.default-preview-image {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.default-logo-mark {
  font-size: 14px;
  letter-spacing: -5px;
  color: #ff6797;
}

.default-preview-image strong {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 2px;
  color: #ed477c;
}

.default-preview-image small {
  font-size: 6px;
  letter-spacing: 1px;
  color: #c1a0ad;
}

/* 카드 정보 영역 */
.preview-card-body {
  padding: 14px 15px 16px;
}

.preview-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.preview-name-row strong {
  min-width: 0;
  color: #202533;
  font-size: 14px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-more {
  color: #8794ab;
  font-size: 18px;
}

.preview-category {
  display: inline-block;
  padding: 5px 9px;
  border-radius: 6px;
  background: #f2f4f8;
  color: #8290a8;
  font-size: 11px;
}

.preview-card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  color: #8994aa;
  font-size: 11px;
}

.preview-guide {
  text-align: center;
  margin: 12px 0 0;
  color: #9aa5b8;
  font-size: 11px;
}

/* 하단 버튼 */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  border-top: 1px solid #edf0f5;
  padding-top: 24px;
}

.cancel-btn,
.create-btn {
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

.cancel-btn:hover {
  background: #dfe2eb;
}

.create-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  background: #ff0860;
  color: #ffffff;
}

.create-btn:hover {
  background: #ed0053;
}

/* 태블릿 */
@media (max-width: 800px) {
  .folder-modal {
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
    padding-bottom: 20px;
    border-right: none;
    border-bottom: 1px solid #edf0f5;
  }

  .preview-column {
    padding-top: 0;
  }
}

/* 모바일 */
@media (max-width: 480px) {
  .modal-overlay {
    padding: 10px;
  }

  .folder-modal {
    max-height: 95vh;
    padding: 20px 16px;
    border-radius: 18px;
  }

  .modal-header h2 {
    font-size: 22px;
  }

  .modal-header p {
    font-size: 13px;
  }

  .folder-color-options {
    gap: 12px;
  }

  .folder-color-option {
    width: 43px;
    height: 43px;
  }

  .thumbnail-upload {
    height: 240px;
  }

  .modal-actions button {
    min-width: 85px;
    font-size: 14px;
    padding: 12px 16px;
  }
}
</style>
