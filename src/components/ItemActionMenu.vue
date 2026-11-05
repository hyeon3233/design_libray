
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  // 'folder' 또는 'file'
  type: {
    type: String,
    required: true
  },

  // 현재 폴더 또는 파일 정보
  item: {
    type: Object,
    required: true
  },

  // 현재 로그인한 사용자 ID
  currentUserId: {
    type: [String, Number],
    default: null
  },

  // 관리자 여부
  isAdmin: {
    type: Boolean,
    default: false
  },

  // 로그인 상태
  isLoggedIn: {
    type: Boolean,
    default: true
  },

  // 이미 즐겨찾기에 등록되어 있는지
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
const menuRoot = ref(null)

// 폴더 삭제 가능 여부
const canDeleteFolder = computed(() => {
  if (props.type !== 'folder') return false

  if (!props.isLoggedIn) return false

  // 관리자는 모든 폴더 삭제 가능
  if (props.isAdmin) return true

  // 생성자 정보가 없으면 일반 사용자는 삭제 불가
  if (
    props.currentUserId == null ||
    props.item.createdBy == null
  ) {
    return false
  }

  return (
    String(props.currentUserId) ===
    String(props.item.createdBy)
  )
})

// 파일은 로그인한 사용자 누구나 삭제 가능
const canDeleteFile = computed(() => {
  return props.type === 'file' && props.isLoggedIn
})

const canDelete = computed(() => {
  return props.type === 'folder'
    ? canDeleteFolder.value
    : canDeleteFile.value
})

function toggleMenu() {
  isOpen.value = !isOpen.value
}

function closeMenu() {
  isOpen.value = false
}

// 메뉴 클릭 시 부모 화면에 이벤트 전달
function selectAction(action) {
  closeMenu()
  emit(action, props.item)
}

// 다른 곳을 누르면 메뉴 닫기
function handleOutsideClick(event) {
  if (
    menuRoot.value &&
    !menuRoot.value.contains(event.target)
  ) {
    closeMenu()
  }
}

// Esc를 누르면 메뉴 닫기
function handleEscape(event) {
  if (event.key === 'Escape') {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', handleOutsideClick)
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', handleOutsideClick)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <div
    ref="menuRoot"
    class="action-menu-root"
    @click.stop
  >
    <!-- 점 세 개 버튼 -->
    <button
      type="button"
      class="more-button"
      :class="{ opened: isOpen }"
      :aria-expanded="isOpen"
      aria-haspopup="menu"
      aria-label="관리 메뉴 열기"
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

    <!-- 관리 메뉴 -->
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

        {{ type === 'folder' ? '폴더 수정' : '파일 정보 수정' }}
      </button>

      <!-- 파일 다운로드 -->
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

      <!-- 이동 -->
      <button
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

        {{ type === 'folder' ? '폴더 이동' : '파일 이동' }}
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
          fill="none"
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

      <!-- 삭제: 권한이 있을 때만 표시 -->
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

          {{ type === 'folder' ? '폴더 삭제' : '파일 삭제' }}
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.action-menu-root {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
}

/* 점 세 개 버튼 */
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
  transition: 0.2s;
}

.more-button:hover,
.more-button.opened {
  background: #fff0f4;
  color: #ff366b;
}

/* 펼쳐지는 메뉴 */
.action-dropdown {
  position: absolute;
  top: calc(100% + 5px);
  right: 0;
  z-index: 100;
  width: 195px;
  padding: 7px;
  box-sizing: border-box;
  border: 1px solid #e9ecf2;
  border-radius: 13px;
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(30, 40, 65, 0.14);
}

/* 메뉴 항목 */
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
  transition: background 0.15s;
}

.menu-item:hover {
  background: #fff0f4;
  color: #ff366b;
}

/* 메뉴 아이콘 */
.menu-item svg {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
}

/* 구분선 */
.menu-divider {
  height: 1px;
  margin: 6px 5px;
  background: #eef0f5;
}

/* 삭제 */
.delete-item {
  color: #f04460;
}

.delete-item:hover {
  background: #fff1f2;
  color: #e62948;
}
</style>
