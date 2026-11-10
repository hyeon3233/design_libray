
<script setup>
import { ref, computed, onMounted, onUnmounted} from 'vue'
import { moveToTrash } from '../stores/trash'
import { folderList } from '../stores/folders'
const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: value =>
      ['folder', 'file'].includes(value)
  },

  item: {
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
  },

  isFavorited: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'edit',
  'move',
  'download',
  'favorite',
  'delete'
])

const isOpen = ref(false)
const showDeleteModal = ref(false)
const menuRoot = ref(null)

// =====================================
// 삭제 권한
// =====================================
const canDeleteFolder = computed(() => {
  if (props.type !== 'folder') return false
  if (!props.isLoggedIn) return false

  if (props.isAdmin) return true

  if (
    props.currentUserId == null ||
    props.item?.createdBy == null
  ) {
    return false
  }

  return (
    String(props.currentUserId) ===
    String(props.item.createdBy)
  )
})

const canDeleteFile = computed(() =>
  props.type === 'file' && props.isLoggedIn
)

const canDelete = computed(() =>
  props.type === 'folder'
    ? canDeleteFolder.value
    : canDeleteFile.value
)

// =====================================
// 모달에 표시할 항목 정보
// =====================================
const itemName = computed(() =>
  props.item.name ||
  props.item.title ||
  (props.type === 'folder' ? '폴더' : '파일')
)

const itemSize = computed(() => {
  if (props.type !== 'file') return ''

  const size = props.item.size

  if (size == null || size === '') return ''

  if (typeof size === 'number') {
    if (size < 1024) {
      return `${size}B`
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)}KB`
    }

    return `${(size / (1024 * 1024)).toFixed(1)}MB`
  }

  return String(size)
})

const itemDescription = computed(() => {
  if (props.type === 'folder') return '폴더'

  return itemSize.value
    ? `파일 · ${itemSize.value}`
    : '파일'
})

// =====================================
// 더보기 메뉴
// =====================================
function toggleMenu() {
  isOpen.value = !isOpen.value
}

function closeMenu() {
  isOpen.value = false
}

function selectAction(action) {
  if (action === 'delete') {
    if (!canDelete.value) return

    closeMenu()

    // 즉시 삭제하지 않고 확인 모달 표시
    showDeleteModal.value = true
    return
  }

  // 폴더 이동은 지원하지 않음
  if (
    action === 'move' &&
    props.type !== 'file'
  ) {
    return
  }

  closeMenu()
  emit(action, props.item)
}

// =====================================
// 삭제 확인 모달
// =====================================
function closeDeleteModal() {
  showDeleteModal.value = false
}


// 삭제 확인창에서 '휴지통으로 이동' 클릭
function confirmDelete() {
  if (!canDelete.value) {
    closeDeleteModal()
    return
  }

  try {
    // 삭제 전 원래 위치 확인
    const parentFolder = folderList.value.find(
      folder =>
        String(folder.id) ===
        String(props.item.folderId)
    )

    const originalLocation =
      props.type === 'folder'
        ? '모든 폴더'
        : (
            parentFolder?.name ||
            props.item.folderName ||
            '홈 파일'
          )

    const success = moveToTrash(
      props.item,
      props.type,
      { originalLocation }
    )

    if (!success) {
      alert('이미 삭제된 항목이거나 이동할 수 없는 항목입니다.')
      return
    }

    // 공통 스토어가 갱신되므로
    // 화면에서도 삭제된 항목이 자동으로 숨겨짐
    closeDeleteModal()

  } catch (error) {
    console.error('휴지통 이동 실패:', error)

    alert(
      error?.message ||
      '휴지통으로 이동하지 못했습니다.'
    )
  }
}


// =====================================
// 바깥 클릭 / ESC
// =====================================
function handleOutsideClick(event) {
  if (
    menuRoot.value &&
    !menuRoot.value.contains(event.target)
  ) {
    closeMenu()
  }
}

function handleEscape(event) {
  if (event.key !== 'Escape') return

  if (showDeleteModal.value) {
    closeDeleteModal()
  } else {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener(
    'pointerdown',
    handleOutsideClick
  )

  document.addEventListener(
    'keydown',
    handleEscape
  )
})

onUnmounted(() => {
  document.removeEventListener(
    'pointerdown',
    handleOutsideClick
  )

  document.removeEventListener(
    'keydown',
    handleEscape
  )
})
</script>

<template>
  <div
    ref="menuRoot"
    class="action-menu-root"
    :class="{ 'is-open': isOpen }"
    @click.stop
  >
    <!-- 점 세 개 버튼 -->
    <button
      type="button"
      class="more-button"
      :class="{ opened: isOpen }"
      :aria-expanded="isOpen"
      :aria-label="`${itemName} 관리 메뉴`"
      aria-haspopup="menu"
      @click.stop="toggleMenu"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <circle cx="5" cy="12" r="1.7" />
        <circle cx="12" cy="12" r="1.7" />
        <circle cx="19" cy="12" r="1.7" />
      </svg>
    </button>

    <!-- ===========================
         관리 메뉴
    ============================ -->
    <div
      v-if="isOpen"
      class="action-dropdown"
      role="menu"
      @click.stop
    >
      <!-- 수정 -->
      <button
        type="button"
        class="menu-item"
        role="menuitem"
        @click.stop="selectAction('edit')"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M12 20h9" />
          <path
            d="M16.5 3.5a2.1 2.1 0 0 1 3 3L9 17l-4 1 1-4L16.5 3.5z"
          />
        </svg>

        {{
          type === 'folder'
            ? '폴더 수정'
            : '파일 정보 수정'
        }}
      </button>

      <!-- 다운로드: 파일 전용 -->
      <button
        v-if="type === 'file'"
        type="button"
        class="menu-item"
        role="menuitem"
        @click.stop="selectAction('download')"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3v12" />
          <path d="m7 10 5 5 5-5" />
          <path d="M5 17v3h14v-3" />
        </svg>

        다운로드
      </button>

      <!-- 이동: 파일 전용 -->
      <button
        v-if="type === 'file'"
        type="button"
        class="menu-item"
        role="menuitem"
        @click.stop="selectAction('move')"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path
            d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10H3z"
          />
          <path d="M9 13h8m-3-3 3 3-3 3" />
        </svg>

        파일 이동
      </button>

      <!-- 즐겨찾기 -->
      <button
        type="button"
        class="menu-item"
        role="menuitem"
        @click.stop="selectAction('favorite')"
      >
        <svg
          viewBox="0 0 24 24"
          :fill="isFavorited ? 'currentColor' : 'none'"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path
            d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z"
          />
        </svg>

        {{
          isFavorited
            ? '즐겨찾기 해제'
            : '즐겨찾기 추가'
        }}
      </button>

      <!-- 삭제 -->
      <template v-if="canDelete">
        <div class="menu-divider"></div>

        <button
          type="button"
          class="menu-item delete-item"
          role="menuitem"
          @click.stop="selectAction('delete')"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M5 6l1 15h12l1-15" />
            <path d="M10 10v7m4-7v7" />
          </svg>

          {{
            type === 'folder'
              ? '폴더 삭제'
              : '파일 삭제'
          }}
        </button>
      </template>
    </div>
  </div>

  <!-- ===========================
       삭제 확인 모달

       Teleport:
       카드의 overflow/z-index 영향을
       받지 않도록 body에 표시
  ============================ -->
  <Teleport to="body">
    <div
      v-if="showDeleteModal"
      class="delete-modal-overlay"
      @click.self="closeDeleteModal"
    >
      <div
        class="delete-confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-desc"
        @click.stop
      >
        <!-- 닫기 -->
        <button
          type="button"
          class="delete-modal-close"
          aria-label="닫기"
          @click="closeDeleteModal"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.3"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <path d="M5 5 19 19M19 5 5 19" />
          </svg>
        </button>

        <!-- 상단 제목 -->
        <div class="delete-modal-heading">
          <div class="delete-modal-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.9"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M5 6l1 15h12l1-15" />
              <path d="M10 10v7m4-7v7" />
            </svg>
          </div>

          <div class="delete-modal-heading-text">
            <h2 id="delete-modal-title">
              휴지통으로 이동하시겠습니까?
            </h2>

            <p id="delete-modal-desc">
              삭제한 항목은 휴지통에서 복원할 수 있습니다.
            </p>
          </div>
        </div>

        <!-- 선택한 파일 / 폴더 정보 -->
        <div class="delete-modal-item">
          <div class="delete-modal-thumbnail">
            <!-- 썸네일이 있으면 이미지 -->
            <img
              v-if="item.thumbnail"
              :src="item.thumbnail"
              :alt="itemName"
            />

            <!-- 폴더 아이콘 -->
            <svg
              v-else-if="type === 'folder'"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 7a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z"
                fill="#FF8FB1"
              />
              <path
                d="M2 10h20v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9z"
                fill="#F96C99"
              />
            </svg>

            <!-- 기본 CHERRY 파일 아이콘 -->
            <div
              v-else
              class="delete-cherry-preview"
            >
              <span class="delete-cherry-symbol">● ●</span>
              <strong>CHERRY</strong>
            </div>
          </div>

          <div class="delete-modal-file-info">
            <strong>{{ itemName }}</strong>
            <span>{{ itemDescription }}</span>
          </div>
        </div>

        <!-- 하단 버튼 -->
        <div class="delete-modal-actions">
          <button
            type="button"
            class="delete-modal-cancel"
            @click="closeDeleteModal"
          >
            취소
          </button>

          <button
            type="button"
            class="delete-modal-confirm"
            @click="confirmDelete"
          >
            휴지통으로 이동
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* =====================================
   점 세 개 메뉴
===================================== */
.action-menu-root {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  z-index: 1;
}

.action-menu-root.is-open {
  z-index: 200;
}

.more-button {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #8f9aae;
  cursor: pointer;
  transition: background .2s, color .2s;
}

.more-button:hover,
.more-button.opened {
  background: #fff0f4;
  color: #ff366b;
}

.action-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 201;
  width: 198px;
  box-sizing: border-box;
  padding: 7px;
  border: 1px solid #e9ecf2;
  border-radius: 13px;
  background: #fff;
  box-shadow: 0 12px 32px rgba(30, 40, 65, .14);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  padding: 11px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #30394a;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  cursor: pointer;
  transition: background .15s, color .15s;
}

.menu-item:hover {
  background: #fff0f4;
  color: #ff366b;
}

.menu-item svg {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
}

.menu-divider {
  height: 1px;
  margin: 6px 5px;
  background: #eef0f5;
}

.delete-item {
  color: #f04460;
}

.delete-item:hover {
  background: #fff1f2;
  color: #e62948;
}

/* =====================================
   삭제 확인 모달 오버레이
===================================== */
.delete-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;

  display: flex;
  align-items: flex-start;
  justify-content: center;

  box-sizing: border-box;
  padding: 115px 16px 20px;

  background: rgba(0, 0, 0, .42);
  overflow-y: auto;
}

/* Figma 기준 489 x 241 */
.delete-confirm-modal {
  position: relative;
  width: 489px;
  max-width: 100%;
  min-height: 241px;
  box-sizing: border-box;

  padding: 20px 21px 22px;
  border-radius: 12px;
  background: #fff;

  box-shadow: 0 16px 48px rgba(20, 25, 40, .17);
}

/* 닫기 버튼 */
.delete-modal-close {
  position: absolute;
  top: 18px;
  right: 18px;

  width: 20px;
  height: 20px;
  padding: 0;

  border: none;
  background: transparent;
  color: #111;
  cursor: pointer;
}

.delete-modal-close svg {
  width: 100%;
  height: 100%;
}

/* =====================================
   모달 상단
===================================== */
.delete-modal-heading {
  display: flex;
  align-items: center;
  gap: 24px;

  margin: 0 22px 13px 5px;
}

.delete-modal-icon {
  width: 55px;
  height: 55px;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 7px;
  background: #ffe9f0;
  color: #ff1761;
}

.delete-modal-icon svg {
  width: 30px;
  height: 30px;
}

.delete-modal-heading-text {
  min-width: 0;
}

.delete-modal-heading h2 {
  margin: 0 0 6px;
  color: #111;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -.3px;
  line-height: 1.4;
}

.delete-modal-heading p {
  margin: 0;
  color: #63718d;
  font-size: 12px;
  line-height: 1.5;
}

/* =====================================
   파일 정보 박스
===================================== */
.delete-modal-item {
  display: flex;
  align-items: center;
  gap: 15px;

  min-height: 66px;
  box-sizing: border-box;
  padding: 8px 13px;

  border: 1px solid #e0e5ef;
  border-radius: 9px;
  background: #fff;
}

.delete-modal-thumbnail {
  width: 61px;
  height: 45px;
  flex-shrink: 0;
  overflow: hidden;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 7px;
  background: #fff0f5;
}

.delete-modal-thumbnail > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete-modal-thumbnail > svg {
  width: 30px;
  height: 30px;
}

.delete-cherry-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  color: #ff1761;
}

.delete-cherry-symbol {
  font-size: 12px;
  letter-spacing: -3px;
}

.delete-cherry-preview strong {
  font-size: 10px;
  letter-spacing: -.4px;
}

.delete-modal-file-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.delete-modal-file-info strong {
  color: #111;
  font-size: 12px;
  font-weight: 700;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delete-modal-file-info span {
  color: #63718d;
  font-size: 11px;
}

/* =====================================
   모달 하단 버튼
===================================== */
.delete-modal-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 11px;
  margin-top: 25px;
}

.delete-modal-cancel,
.delete-modal-confirm {
  height: 38px;
  box-sizing: border-box;

  border-radius: 8px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;

  transition: .2s;
}

.delete-modal-cancel {
  width: 98px;
  border: 1px solid #303030;
  background: #fff;
  color: #414961;
}

.delete-modal-cancel:hover {
  background: #f7f8fa;
}

.delete-modal-confirm {
  width: 144px;
  border: 1px solid #ff1761;
  background: #ff1761;
  color: #fff;
}

.delete-modal-confirm:hover {
  background: #ed0a53;
}

/* 모바일 */
@media (max-width: 600px) {
  .delete-modal-overlay {
    padding: 80px 16px 20px;
  }

  .delete-confirm-modal {
    min-height: 241px;
  }

  .delete-modal-heading {
    gap: 13px;
    margin-right: 18px;
  }

  .delete-modal-icon {
    width: 45px;
    height: 45px;
  }

  .delete-modal-icon svg {
    width: 25px;
    height: 25px;
  }

  .delete-modal-heading h2 {
    font-size: 14px;
  }

  .delete-modal-heading p {
    font-size: 11px;
  }
}
</style>
