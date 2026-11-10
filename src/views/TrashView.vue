
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { trashItems as storedTrashItems, restoreFromTrash, permanentlyDelete } from '../stores/trash'

// 실제 휴지통 데이터 사용
const trashItems = computed(() =>
  storedTrashItems.value.map(entry => {
    const date = new Date(entry.deletedAt)

    const deletedAt = Number.isNaN(date.getTime())
      ? entry.deletedAt
      : [
          `${date.getFullYear()}.`,
          `${String(date.getMonth() + 1).padStart(2, '0')}.`,
          String(date.getDate()).padStart(2, '0'),
          ' ',
          String(date.getHours()).padStart(2, '0'),
          ':',
          String(date.getMinutes()).padStart(2, '0')
        ].join('')

    return {
      ...entry,

      // 테이블에서 사용하는 식별자를
      // 폴더/파일별 고유 키로 통일
      id: entry.key,
      deletedAt,
      originalLocation:
        entry.originalLocation || '전체 파일'
    }
  })
)


// ====================================
// 검색 및 필터
// ====================================
const activeFilter = ref('all')
const searchQuery = ref('')
const sortDescending = ref(true)

const filters = [
  { value: 'all', label: '전체' },
  { value: 'folder', label: '폴더' },
  { value: 'file', label: '파일' }
]

const folderCount = computed(() =>
  trashItems.value.filter(
    item => item.kind === 'folder'
  ).length
)

const fileCount = computed(() =>
  trashItems.value.filter(
    item => item.kind === 'file'
  ).length
)

function getFilterCount(value) {
  if (value === 'folder') return folderCount.value
  if (value === 'file') return fileCount.value
  return trashItems.value.length
}

const filteredItems = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return trashItems.value
    .filter(item => {
      const filterMatch =
        activeFilter.value === 'all' ||
        item.kind === activeFilter.value

      const searchMatch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.originalLocation
          .toLowerCase()
          .includes(query)

      return filterMatch && searchMatch
    })
    .sort((a, b) => {
      const compare = a.deletedAt.localeCompare(
        b.deletedAt
      )

      return sortDescending.value
        ? -compare
        : compare
    })
})

// ====================================
// 체크박스 선택
// ====================================
const selectedIds = ref([])

const selectedCount = computed(() =>
  selectedIds.value.length
)

const allSelected = computed(() =>
  filteredItems.value.length > 0 &&
  filteredItems.value.every(item =>
    selectedIds.value.includes(item.id)
  )
)

const partiallySelected = computed(() =>
  !allSelected.value &&
  filteredItems.value.some(item =>
    selectedIds.value.includes(item.id)
  )
)

function toggleSelectAll(checked) {
  const ids = filteredItems.value.map(item => item.id)

  if (checked) {
    selectedIds.value = [
      ...new Set([...selectedIds.value, ...ids])
    ]
  } else {
    selectedIds.value = selectedIds.value.filter(
      id => !ids.includes(id)
    )
  }
}

function toggleSelected(id, checked) {
  if (checked) {
    if (!selectedIds.value.includes(id)) {
      selectedIds.value = [...selectedIds.value, id]
    }
  } else {
    selectedIds.value = selectedIds.value.filter(
      selectedId => selectedId !== id
    )
  }
}

// ====================================
// 개별 관리 메뉴
// ====================================
const openedMenuId = ref(null)

function toggleRowMenu(id) {
  openedMenuId.value =
    openedMenuId.value === id ? null : id
}

function closeRowMenu() {
  openedMenuId.value = null
}

function handleOutsideClick(event) {
  if (!event.target.closest('.row-menu')) {
    closeRowMenu()
  }
}

// ====================================
// 복원 / 영구 삭제 확인 모달
// ====================================
const modalType = ref(null)
const targetIds = ref([])

const targetItems = computed(() =>
  trashItems.value.filter(item =>
    targetIds.value.includes(item.id)
  )
)

const isMultiple = computed(() =>
  targetItems.value.length > 1
)

const modalTitle = computed(() => {
  if (modalType.value === 'restore') {
    return '선택한 항목을 복원하시겠습니까?'
  }

  return '영구 삭제 하시겠습니까?'
})

const modalDescription = computed(() => {
  if (modalType.value === 'restore') {
    return '원래 위치로 다시 이동됩니다.'
  }

  return '영구 삭제한 항목은 복구가 불가능합니다.'
})

function openModal(type, ids) {
  if (!ids.length) return

  targetIds.value = [...ids]
  modalType.value = type
  closeRowMenu()
}

function closeModal() {
  modalType.value = null
  targetIds.value = []
}


const isProcessing = ref(false)

async function confirmAction() {
  if (isProcessing.value) return
  if (!targetIds.value.length) return

  isProcessing.value = true

  try {
    let success = false

    if (modalType.value === 'restore') {
      // 원래 위치로 복원
      success = restoreFromTrash(
        targetIds.value
      )
    } else if (modalType.value === 'delete') {
      // IndexedDB 및 휴지통에서 영구 삭제
      success = await permanentlyDelete(
        targetIds.value
      )
    }

    if (!success) {
      throw new Error(
        '처리할 항목을 찾을 수 없습니다.'
      )
    }

    const completedKeys = new Set(
      targetIds.value
    )

    // 처리 완료된 체크박스 선택 해제
    selectedIds.value = selectedIds.value.filter(
      id => !completedKeys.has(id)
    )

    closeModal()

  } catch (error) {
    console.error('휴지통 처리 실패:', error)

    alert(
      error?.message ||
      '요청을 처리하지 못했습니다.'
    )
  } finally {
    isProcessing.value = false
  }
}


function handleKeydown(event) {
  if (event.key === 'Escape') {
    if (modalType.value) {
      closeModal()
    } else {
      closeRowMenu()
    }
  }
}

onMounted(() => {
  document.addEventListener(
    'pointerdown',
    handleOutsideClick
  )

  document.addEventListener(
    'keydown',
    handleKeydown
  )
})

onUnmounted(() => {
  document.removeEventListener(
    'pointerdown',
    handleOutsideClick
  )

  document.removeEventListener(
    'keydown',
    handleKeydown
  )
})
</script>

<template>
  <div class="trash-page">

    <!-- 페이지 제목 -->
    <div class="page-heading">
      <h1>휴지통</h1>
      <p>
        삭제한 폴더와 파일을 관리할 수 있어요.
        복원하거나 영구 삭제할 수 있습니다.
      </p>
    </div>

    <!-- 필터 및 검색 -->
    <div class="trash-toolbar">
      <div class="filter-list">
        <button
          v-for="filter in filters"
          :key="filter.value"
          type="button"
          class="filter-btn"
          :class="{
            active: activeFilter === filter.value
          }"
          @click="activeFilter = filter.value"
        >
          {{ filter.label }}
          {{ getFilterCount(filter.value) }}
        </button>
      </div>

      <div class="trash-search">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <circle cx="10.8" cy="10.8" r="6.8" />
          <path d="m16 16 5 5" />
        </svg>

        <input
          v-model="searchQuery"
          type="search"
          placeholder="삭제한 항목 검색"
          aria-label="삭제한 항목 검색"
        />
      </div>
    </div>

    <!-- 휴지통 목록 -->
    <div
      v-if="trashItems.length"
      class="trash-table-wrap"
    >
      <div class="table-scroll">
        <table class="trash-table">
          <colgroup>
            <col class="col-check" />
            <col class="col-name" />
            <col class="col-type" />
            <col class="col-date" />
            <col class="col-location" />
            <col class="col-menu" />
          </colgroup>

          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  class="custom-checkbox"
                  aria-label="전체 선택"
                  :checked="allSelected"
                  :indeterminate="partiallySelected"
                  @change="
                    toggleSelectAll(
                      $event.target.checked
                    )
                  "
                />
              </th>

              <th>이름</th>
              <th>종류</th>

              <th>
                <button
                  type="button"
                  class="sort-button"
                  @click="
                    sortDescending = !sortDescending
                  "
                >
                  삭제한 날짜
                  <span>
                    {{ sortDescending ? '↓' : '↑' }}
                  </span>
                </button>
              </th>

              <th>원래 위치</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="item in filteredItems"
              :key="item.id"
              :class="{
                selected: selectedIds.includes(item.id),
                'menu-open': openedMenuId === item.id
              }"
            >
              <!-- 선택 -->
              <td>
                <input
                  type="checkbox"
                  class="custom-checkbox"
                  :aria-label="`${item.name} 선택`"
                  :checked="selectedIds.includes(item.id)"
                  @change="
                    toggleSelected(
                      item.id,
                      $event.target.checked
                    )
                  "
                />
              </td>

              <!-- 이름 / 썸네일 -->
              <td>
                <div class="item-name-cell">

                  <div
                    v-if="item.kind === 'folder'"
                    class="item-thumbnail folder-thumb"
                  >
                    <svg
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
                  </div>

                  <div
                    v-else
                    class="item-thumbnail file-thumb"
                  >
                    <img
                      v-if="item.thumbnail"
                      :src="item.thumbnail"
                      :alt="item.name"
                    />

                    <svg
                      v-else
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#F66B97"
                      stroke-width="1.5"
                      aria-hidden="true"
                    >
                      <rect
                        x="3"
                        y="3"
                        width="18"
                        height="18"
                        rx="3"
                      />
                      <circle cx="8" cy="8" r="2" />
                      <path d="m4 18 5-5 4 4 3-3 4 4" />
                    </svg>
                  </div>

                  <span class="item-name">
                    {{ item.name }}
                  </span>
                </div>
              </td>

              <!-- 종류 -->
              <td>
                <span class="type-badge">
                  {{
                    item.kind === 'folder'
                      ? '폴더'
                      : '파일'
                  }}
                </span>
              </td>

              <!-- 삭제 날짜 -->
              <td class="date-cell">
                {{ item.deletedAt }}
              </td>

              <!-- 원래 위치 -->
              <td>
                <div class="location-cell">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10H3z"
                    />
                  </svg>

                  <span>
                    {{ item.originalLocation }}
                  </span>
                </div>
              </td>

              <!-- 개별 메뉴 -->
              <td>
                <div
                  class="row-menu"
                  @click.stop
                >
                  <button
                    type="button"
                    class="more-btn"
                    :aria-label="`${item.name} 관리 메뉴`"
                    :aria-expanded="openedMenuId === item.id"
                    @click="toggleRowMenu(item.id)"
                  >
                    ···
                  </button>

                  <div
                    v-if="openedMenuId === item.id"
                    class="row-dropdown"
                  >
                    <button
                      type="button"
                      @click="
                        openModal('restore', [item.id])
                      "
                    >
                      <span class="menu-symbol">↶</span>
                      복원
                    </button>

                    <div class="dropdown-divider"></div>

                    <button
                      type="button"
                      class="danger-menu"
                      @click="
                        openModal('delete', [item.id])
                      "
                    >
                      <span class="menu-symbol">×</span>
                      영구 삭제
                    </button>
                  </div>
                </div>
              </td>
            </tr>

            <tr v-if="!filteredItems.length">
              <td colspan="6">
                <div class="no-results">
                  검색 결과가 없습니다.
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 하단 선택 버튼 -->
      <div class="table-footer">
        <label class="selection-info">
          <input
            type="checkbox"
            class="custom-checkbox"
            :checked="allSelected"
            :indeterminate="partiallySelected"
            :disabled="!filteredItems.length"
            @change="
              toggleSelectAll(
                $event.target.checked
              )
            "
          />

          <span>{{ selectedCount }}개 선택</span>
        </label>

        <div class="footer-buttons">

          <button
            type="button"
            class="restore-btn"
            :disabled="!selectedCount"
            @click="
              openModal('restore', selectedIds)
            "
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
              <path d="M9 14 4 9l5-5" />
              <path d="M4 9h10a6 6 0 0 1 0 12h-2" />
            </svg>
            복원
          </button>

          <button
            type="button"
            class="delete-btn"
            :disabled="!selectedCount"
            @click="
              openModal('delete', selectedIds)
            "
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M5 6l1 15h12l1-15" />
              <path d="M10 10v7m4-7v7" />
            </svg>
            영구 삭제
          </button>

        </div>
      </div>
    </div>

    <!-- 휴지통이 비어 있을 때 -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
        >
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M5 6l1 15h12l1-15" />
          <path d="M10 10v7m4-7v7" />
        </svg>
      </div>

      <h3>휴지통이 비어 있어요.</h3>
      <p>삭제한 폴더와 파일이 이곳에 표시됩니다.</p>
    </div>

    <!-- ====================================
         복원 / 영구 삭제 확인 모달
         이미지 디자인 적용
    ===================================== -->
    <div
      v-if="modalType"
      class="modal-overlay"
      @click.self="closeModal"
    >
      <div
        class="confirm-modal"
        role="dialog"
        aria-modal="true"
        :aria-label="modalTitle"
      >

        <!-- 닫기 버튼 -->
        <button
          type="button"
          class="modal-close"
          aria-label="닫기"
          @click="closeModal"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <path d="M5 5 19 19M19 5 5 19" />
          </svg>
        </button>

        <!-- 상단 아이콘 및 문구 -->
        <div class="modal-heading">
          <div class="modal-icon">

            <!-- 복원 아이콘 -->
            <svg
              v-if="modalType === 'restore'"
              viewBox="0 0 48 48"
              fill="none"
              stroke="currentColor"
              stroke-width="3.2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M19 11 8 22l11 10" />
              <path
                d="M9 22h20c8 0 13 5 13 12s-5 11-13 11H18"
                transform="translate(0 -5)"
              />
            </svg>

            <!-- 영구 삭제 아이콘 -->
            <svg
              v-else
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
          </div>

          <div class="modal-heading-text">
            <h2>{{ modalTitle }}</h2>
            <p>{{ modalDescription }}</p>
          </div>
        </div>

        <!-- 선택한 파일 정보 -->
        <div class="modal-item-list">

          <div
            v-for="item in targetItems.slice(0, 3)"
            :key="item.id"
            class="modal-item"
          >
            <!-- 이미지 / 파일 / 폴더 아이콘 -->
            <div class="modal-item-thumbnail">
              <img
                v-if="item.thumbnail"
                :src="item.thumbnail"
                :alt="item.name"
              />

              <svg
                v-else-if="item.kind === 'folder'"
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

              <!-- 이미지가 없는 파일: CHERRY 스타일 -->
              <div v-else class="cherry-preview">
                <span class="cherry-symbol">● ●</span>
                <strong>CHERRY</strong>
              </div>
            </div>

            <!-- 파일 정보 -->
            <div class="modal-item-info">
              <strong>{{ item.name }}</strong>

              <span>
                {{
                  item.kind === 'folder'
                    ? '폴더'
                    : '파일'
                }}

                <template v-if="item.size">
                  · {{ item.size }}
                </template>
              </span>
            </div>
          </div>

          <!-- 여러 개 선택한 경우 -->
          <p
            v-if="isMultiple && targetItems.length > 3"
            class="more-items"
          >
            외 {{ targetItems.length - 3 }}개 항목
          </p>
        </div>

        <!-- 하단 버튼 -->
        <div class="modal-actions">
          <button
            type="button"
            class="modal-cancel"
            @click="closeModal"
          >
            취소
          </button>

          <button
            type="button"
            class="modal-confirm"
            @click="confirmAction"
          >
            {{
              modalType === 'restore'
                ? '복원'
                : '영구 삭제'
            }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* ====================================
   페이지
==================================== */
.trash-page {
  width: 100%;
  min-width: 0;
  padding-bottom: 40px;
  color: #252c39;
}

.page-heading {
  margin-bottom: 38px;
}

.page-heading h1 {
  margin: 0 0 10px;
  font-size: 30px;
  font-weight: 700;
  color: #111;
}

.page-heading p {
  margin: 0;
  color: #7b89a5;
  font-size: 15px;
  line-height: 1.6;
}

/* ====================================
   필터 / 검색
==================================== */
.trash-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 30px;
}

.filter-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-btn {
  padding: 11px 22px;
  border: 1px solid #e5e9f1;
  border-radius: 13px;
  background: #fff;
  color: #30394a;
  font: 600 14px inherit;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: .2s;
}

.filter-btn:hover {
  border-color: #ffc3d3;
  color: #ff366b;
}

.filter-btn.active {
  border-color: #ffe5ed;
  background: #ffe7ef;
  color: #ff366b;
}

.trash-search {
  width: 340px;
  max-width: 100%;
  height: 44px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 15px;
  border: 1px solid #e5e9f1;
  border-radius: 12px;
  background: #fff;
}

.trash-search:focus-within {
  border-color: #ff7296;
}

.trash-search svg {
  width: 18px;
  height: 18px;
  color: #30394a;
  flex-shrink: 0;
}

.trash-search input {
  width: 100%;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: #30394a;
  font-family: inherit;
  font-size: 13px;
}

.trash-search input::placeholder {
  color: #a0aabc;
}

/* ====================================
   테이블
==================================== */
.trash-table-wrap {
  border: 1px solid #edf0f5;
  border-radius: 14px;
  background: #fff;
}

.table-scroll {
  overflow: visible;
}

.trash-table {
  width: 100%;
  min-width: 850px;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
}

.col-check { width: 6%; }
.col-name { width: 36%; }
.col-type { width: 12%; }
.col-date { width: 18%; }
.col-location { width: 22%; }
.col-menu { width: 6%; }

.trash-table th {
  height: 49px;
  padding: 0 12px;
  background: #f8f9fc;
  color: #30394a;
  font-size: 13px;
  font-weight: 600;
  text-align: left;
  white-space: nowrap;
}

.trash-table th:first-child {
  border-top-left-radius: 13px;
}

.trash-table th:last-child {
  border-top-right-radius: 13px;
}

.trash-table td {
  position: relative;
  height: 63px;
  box-sizing: border-box;
  padding: 7px 12px;
  border-top: 1px solid #eef0f4;
  color: #30394a;
  font-size: 13px;
  background: #fff;
}

.trash-table tbody tr:hover td {
  background: #fcfcfe;
}

.trash-table tbody tr.selected td {
  background: #fff8fa;
}

.trash-table tbody tr.menu-open td {
  z-index: 100;
}

.sort-button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

/* 체크박스 */
.custom-checkbox {
  width: 19px;
  height: 19px;
  margin: 0;
  accent-color: #ff366b;
  cursor: pointer;
  vertical-align: middle;
}

/* 파일 이름 */
.item-name-cell {
  display: flex;
  align-items: center;
  gap: 15px;
  min-width: 0;
}

.item-thumbnail {
  width: 48px;
  height: 45px;
  flex-shrink: 0;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.folder-thumb,
.file-thumb {
  background: #fff0f5;
}

.folder-thumb svg {
  width: 31px;
  height: 31px;
}

.file-thumb svg {
  width: 28px;
  height: 28px;
}

.file-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #202533;
  font-size: 13px;
  font-weight: 600;
}

/* 종류 및 위치 */
.type-badge {
  display: inline-block;
  padding: 5px 9px;
  border-radius: 7px;
  background: #f1f3f8;
  color: #637087;
  font-size: 12px;
}

.date-cell {
  color: #536078 !important;
  white-space: nowrap;
}

.location-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.location-cell svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: #44526b;
}

.location-cell span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ====================================
   개별 더보기 메뉴
==================================== */
.row-menu {
  position: relative;
  display: flex;
  justify-content: center;
}

.more-btn {
  width: 30px;
  height: 30px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #67748c;
  font-size: 20px;
  cursor: pointer;
}

.more-btn:hover {
  background: #fff0f4;
  color: #ff366b;
}

.row-dropdown {
  position: absolute;
  right: 0;
  top: 35px;
  z-index: 300;
  width: 155px;
  padding: 6px;
  border: 1px solid #e9ecf2;
  border-radius: 11px;
  background: #fff;
  box-shadow: 0 9px 28px rgba(30,40,65,.13);
}

.row-dropdown button {
  width: 100%;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: #30394a;
  font-family: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
}

.row-dropdown button:hover {
  background: #fff0f4;
  color: #ff366b;
}

.row-dropdown button.danger-menu {
  color: #f04460;
}

.row-dropdown button.danger-menu:hover {
  background: #fff1f2;
}

.menu-symbol {
  width: 17px;
  font-size: 19px;
  text-align: center;
}

.dropdown-divider {
  height: 1px;
  margin: 4px;
  background: #eef0f5;
}

.no-results {
  padding: 45px 20px;
  text-align: center;
  color: #8994a8;
}

/* ====================================
   하단 버튼
==================================== */
.table-footer {
  min-height: 77px;
  box-sizing: border-box;
  padding: 13px 20px;
  border-top: 1px solid #edf0f5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.selection-info {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #202533;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.footer-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.restore-btn,
.delete-btn {
  height: 42px;
  box-sizing: border-box;
  padding: 0 23px;
  border-radius: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: .2s;
}

.restore-btn svg,
.delete-btn svg {
  width: 18px;
  height: 18px;
}

.restore-btn {
  border: 1px solid #dce1ec;
  background: #fff;
  color: #536079;
}

.restore-btn:hover:not(:disabled) {
  border-color: #ff7296;
  color: #ff366b;
}

.delete-btn {
  border: 1px solid #ff7296;
  background: #fff;
  color: #ff366b;
}

.delete-btn:hover:not(:disabled) {
  background: #fff0f4;
}

.restore-btn:disabled,
.delete-btn:disabled {
  opacity: .45;
  cursor: not-allowed;
}

/* 빈 화면 */
.empty-state {
  min-height: 340px;
  padding: 65px 20px;
  box-sizing: border-box;
  border: 1px dashed #e1e5ee;
  border-radius: 15px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  width: 65px;
  height: 65px;
  border-radius: 18px;
  background: #fff0f4;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon svg {
  width: 32px;
  height: 32px;
  color: #ff7296;
}

.empty-state h3 {
  margin: 20px 0 9px;
  color: #30394a;
  font-size: 18px;
}

.empty-state p {
  margin: 0;
  color: #8994a8;
  font-size: 13px;
}

/* ====================================
   모달 - 보내준 이미지 기준
==================================== */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, .42);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 100px 20px 30px;
  box-sizing: border-box;
  overflow-y: auto;
}

.confirm-modal {
  position: relative;
  width: 690px;
  max-width: 100%;
  min-height: 340px;
  box-sizing: border-box;
  padding: 28px 30px 31px;
  border-radius: 17px;
  background: #fff;
  box-shadow: 0 20px 60px rgba(25,30,45,.15);
}

/* 닫기 */
.modal-close {
  position: absolute;
  top: 25px;
  right: 25px;
  width: 29px;
  height: 29px;
  padding: 3px;
  border: none;
  background: transparent;
  color: #111;
  cursor: pointer;
  z-index: 2;
}

.modal-close svg {
  width: 100%;
  height: 100%;
}

/* 상단 안내 */
.modal-heading {
  display: flex;
  align-items: center;
  gap: 34px;
  margin: 0 30px 18px 8px;
}

.modal-icon {
  width: 78px;
  height: 78px;
  flex-shrink: 0;
  border-radius: 9px;
  background: #ffe9f0;
  color: #ff1761;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-icon svg {
  width: 42px;
  height: 42px;
}

.modal-heading-text {
  min-width: 0;
}

.modal-heading h2 {
  margin: 0 0 10px;
  color: #101010;
  font-size: 23px;
  font-weight: 700;
  letter-spacing: -.6px;
  line-height: 1.4;
}

.modal-heading p {
  margin: 0;
  color: #63718d;
  font-size: 16px;
  line-height: 1.5;
}

/* 파일 정보 박스 */
.modal-item-list {
  padding: 8px 18px;
  border: 1px solid #e0e5ef;
  border-radius: 13px;
  background: #fff;
}

.modal-item {
  display: flex;
  align-items: center;
  gap: 21px;
  min-height: 76px;
}

.modal-item + .modal-item {
  border-top: 1px solid #eef0f5;
}

.modal-item-thumbnail {
  width: 86px;
  height: 64px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 10px;
  background: #fff0f5;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-item-thumbnail > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-item-thumbnail > svg {
  width: 42px;
  height: 42px;
}

.cherry-preview {
  width: 100%;
  height: 100%;
  color: #ff1761;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.cherry-symbol {
  font-size: 16px;
  letter-spacing: -4px;
}

.cherry-preview strong {
  font-size: 12px;
  letter-spacing: -.4px;
}

.modal-item-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.modal-item-info strong {
  color: #101010;
  font-size: 16px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modal-item-info span {
  color: #63718d;
  font-size: 15px;
}

.more-items {
  margin: 0;
  padding: 8px 0;
  color: #8994a8;
  font-size: 13px;
}

/* 취소 / 확인 버튼 */
.modal-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 35px;
}

.modal-cancel,
.modal-confirm {
  height: 54px;
  box-sizing: border-box;
  border-radius: 12px;
  font-family: inherit;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: .2s;
}

.modal-cancel {
  width: 138px;
  border: 1px solid #303030;
  background: #fff;
  color: #414961;
}

.modal-cancel:hover {
  background: #f7f8fa;
}

.modal-confirm {
  width: 203px;
  border: 1px solid #ff1761;
  background: #ff1761;
  color: #fff;
}

.modal-confirm:hover {
  background: #ed0a53;
}

/* ====================================
   반응형
==================================== */
@media (max-width: 900px) {
  .trash-toolbar {
    flex-wrap: wrap;
  }

  .trash-search {
    width: 100%;
  }

  .table-scroll {
    overflow-x: auto;
  }
}

@media (max-width: 600px) {
  .page-heading h1 {
    font-size: 25px;
  }

  .page-heading p {
    font-size: 13px;
  }

  .filter-list {
    gap: 7px;
  }

  .filter-btn {
    padding: 9px 13px;
    font-size: 12px;
  }

  .table-footer {
    flex-wrap: wrap;
  }

  .footer-buttons {
    width: 100%;
  }

  .restore-btn,
  .delete-btn {
    flex: 1;
    padding: 0 10px;
  }

  .modal-overlay {
    align-items: center;
    padding: 20px;
  }

  .confirm-modal {
    min-height: auto;
    padding: 22px 18px;
  }

  .modal-heading {
    gap: 14px;
    margin: 0 25px 20px 0;
  }

  .modal-icon {
    width: 52px;
    height: 52px;
  }

  .modal-icon svg {
    width: 29px;
    height: 29px;
  }

  .modal-heading h2 {
    font-size: 17px;
  }

  .modal-heading p {
    font-size: 12px;
  }

  .modal-item-thumbnail {
    width: 57px;
    height: 50px;
  }

  .modal-item {
    gap: 12px;
  }

  .modal-item-info strong {
    font-size: 13px;
  }

  .modal-item-info span {
    font-size: 12px;
  }

  .modal-actions {
    gap: 10px;
    margin-top: 25px;
  }

  .modal-cancel,
  .modal-confirm {
    flex: 1;
    width: auto;
    height: 45px;
    font-size: 14px;
  }
}

/* ====================================
   복원 / 영구 삭제 모달 크기 수정
   Figma 기준 489 × 241px
==================================== */

.modal-overlay {
  align-items: flex-start;
  justify-content: center;
  padding: 115px 20px 20px;
}

.confirm-modal {
  width: 489px;
  max-width: 100%;
  min-height: 241px;
  padding: 20px 21px 22px;
  border-radius: 12px;
}

/* 닫기 버튼 */
.modal-close {
  top: 18px;
  right: 18px;
  width: 20px;
  height: 20px;
}

/* 상단 제목 영역 */
.modal-heading {
  gap: 24px;
  margin: 0 22px 13px 5px;
}

.modal-icon {
  width: 55px;
  height: 55px;
  border-radius: 7px;
}

.modal-icon svg {
  width: 30px;
  height: 30px;
}

.modal-heading h2 {
  margin: 0 0 6px;
  font-size: 16px;
  letter-spacing: -0.3px;
}

.modal-heading p {
  font-size: 12px;
}

/* 파일 정보 박스 */
.modal-item-list {
  padding: 5px 13px;
  border-radius: 9px;
}

.modal-item {
  min-height: 54px;
  gap: 15px;
}

.modal-item-thumbnail {
  width: 61px;
  height: 45px;
  border-radius: 7px;
}

.modal-item-thumbnail > svg {
  width: 30px;
  height: 30px;
}

.modal-item-info {
  gap: 5px;
}

.modal-item-info strong {
  font-size: 12px;
}

.modal-item-info span {
  font-size: 11px;
}

.cherry-preview strong {
  font-size: 10px;
}

/* 하단 버튼 */
.modal-actions {
  gap: 11px;
  margin-top: 25px;
}

.modal-cancel,
.modal-confirm {
  height: 38px;
  border-radius: 8px;
  font-size: 12px;
}

.modal-cancel {
  width: 98px;
}

.modal-confirm {
  width: 144px;
}

/* 모바일 화면 대응 */
@media (max-width: 600px) {
  .modal-overlay {
    padding: 80px 16px 20px;
  }

  .confirm-modal {
    width: 100%;
    min-height: auto;
  }
}

</style>
