
<script setup>
import { computed } from 'vue'

import {
  selectedFiles,
  selectedFileCount,
  isSelectionDeleteOpen,
  selectionOwnerId,
  closeSelectionDelete,
  confirmSelectionDelete
} from '../stores/fileSelection'

const props = defineProps({
  ownerId: {
    type: [String, Number, Symbol],
    required: true
  }
})

// 현재 카드가 이 모달을 표시할 담당인지
const shouldShow = computed(() =>
  isSelectionDeleteOpen.value &&
  selectionOwnerId.value === props.ownerId
)

const displayFiles = computed(() =>
  selectedFiles.value.slice(0, 3)
)

function fileSize(file) {
  if (file.size == null || file.size === '') {
    return '파일'
  }

  if (typeof file.size === 'number') {
    const bytes = file.size

    if (bytes < 1024) return `파일 · ${bytes}B`
    if (bytes < 1024 * 1024) {
      return `파일 · ${(bytes / 1024).toFixed(1)}KB`
    }

    return `파일 · ${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  return `파일 · ${file.size}`
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="shouldShow"
      class="selection-delete-overlay"
      @click.self="closeSelectionDelete"
    >
      <div
        class="selection-delete-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="selection-delete-title"
        aria-describedby="selection-delete-description"
      >
        <!-- 닫기 -->
        <button
          type="button"
          class="modal-close"
          aria-label="닫기"
          @click="closeSelectionDelete"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.3"
            stroke-linecap="round"
          >
            <path d="M5 5 19 19M19 5 5 19" />
          </svg>
        </button>

        <!-- 상단 -->
        <div class="modal-heading">
          <div class="modal-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.9"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M5 6l1 15h12l1-15" />
              <path d="M10 10v7m4-7v7" />
            </svg>
          </div>

          <div class="modal-heading-text">
            <h2 id="selection-delete-title">
              휴지통으로 이동하시겠습니까?
            </h2>

            <p id="selection-delete-description">
              삭제한 항목은 휴지통에서 복원할 수 있습니다.
            </p>
          </div>
        </div>

        <!-- 선택 파일 목록 -->
        <div class="selected-item-list">
          <div
            v-for="entry in displayFiles"
            :key="entry.key"
            class="selected-item"
          >
            <div class="item-thumbnail">
              <img
                v-if="entry.file.thumbnail"
                :src="entry.file.thumbnail"
                :alt="entry.file.name"
              />

              <div v-else class="cherry-preview">
                <span>● ●</span>
                <strong>CHERRY</strong>
              </div>
            </div>

            <div class="item-info">
              <strong>
                {{ entry.file.name }}
              </strong>

              <span>
                {{ fileSize(entry.file) }}
              </span>
            </div>
          </div>

          <p
            v-if="selectedFileCount > 3"
            class="more-count"
          >
            외 {{ selectedFileCount - 3 }}개 파일
          </p>
        </div>

        <!-- 버튼 -->
        <div class="modal-actions">
          <button
            type="button"
            class="cancel-button"
            @click="closeSelectionDelete"
          >
            취소
          </button>

          <button
            type="button"
            class="confirm-button"
            @click="confirmSelectionDelete"
          >
            휴지통으로 이동
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.selection-delete-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 115px 16px 20px;
  box-sizing: border-box;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.42);
}

.selection-delete-modal {
  position: relative;
  width: 489px;
  max-width: 100%;
  min-height: 241px;
  box-sizing: border-box;
  padding: 20px 21px 22px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 16px 48px rgba(20, 25, 40, 0.17);
}

.modal-close {
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

.modal-close svg {
  width: 100%;
  height: 100%;
}

.modal-heading {
  display: flex;
  align-items: center;
  gap: 24px;
  margin: 0 22px 13px 5px;
}

.modal-icon {
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

.modal-icon svg {
  width: 30px;
  height: 30px;
}

.modal-heading-text {
  min-width: 0;
}

.modal-heading h2 {
  margin: 0 0 6px;
  color: #111;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.3px;
  line-height: 1.4;
}

.modal-heading p {
  margin: 0;
  color: #63718d;
  font-size: 12px;
  line-height: 1.5;
}

.selected-item-list {
  padding: 8px 13px;
  border: 1px solid #e0e5ef;
  border-radius: 9px;
  background: #fff;
}

.selected-item {
  display: flex;
  align-items: center;
  gap: 15px;
  min-height: 49px;
}

.selected-item + .selected-item {
  border-top: 1px solid #eef0f5;
  padding-top: 8px;
  margin-top: 8px;
}

.item-thumbnail {
  width: 61px;
  height: 45px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 7px;
  background: #fff0f5;
}

.item-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cherry-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  color: #ff1761;
}

.cherry-preview span {
  font-size: 12px;
  letter-spacing: -3px;
}

.cherry-preview strong {
  font-size: 10px;
}

.item-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.item-info strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #111;
  font-size: 12px;
  font-weight: 700;
}

.item-info span,
.more-count {
  color: #63718d;
  font-size: 11px;
}

.more-count {
  margin: 8px 0 0;
}

.modal-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 11px;
  margin-top: 25px;
}

.cancel-button,
.confirm-button {
  height: 38px;
  box-sizing: border-box;
  border-radius: 8px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.cancel-button {
  width: 98px;
  border: 1px solid #303030;
  background: #fff;
  color: #414961;
}

.confirm-button {
  width: 144px;
  border: 1px solid #ff1761;
  background: #ff1761;
  color: #fff;
}

.confirm-button:hover {
  background: #ed0a53;
}

@media (max-width: 600px) {
  .selection-delete-overlay {
    padding: 80px 16px 20px;
  }

  .modal-heading {
    gap: 13px;
  }

  .modal-icon {
    width: 45px;
    height: 45px;
  }

  .modal-heading h2 {
    font-size: 14px;
  }

  .modal-heading p {
    font-size: 11px;
  }
}
</style>
