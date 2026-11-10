
import { ref, computed } from 'vue'
import { moveToTrash } from './trash'
import { folderList } from './folders'

// 선택된 파일: { key, file } 형태
export const selectedFiles = ref([])

// 삭제 확인창 표시 여부
export const isSelectionDeleteOpen = ref(false)

// 어느 카드에서 확인창을 렌더링할지 구분
export const selectionOwnerId = ref(null)

export const selectedFileCount = computed(
  () => selectedFiles.value.length
)

const fileRegistry = new Map()

let lastSelectedKey = null
let currentScope = null

export function fileSelectionKey(file) {
  return [
    String(file.folderId ?? 'home'),
    String(file.id)
  ].join('::')
}

export function registerSelectableFile(file) {
  fileRegistry.set(fileSelectionKey(file), file)
}

export function unregisterSelectableFile(file) {
  const key = fileSelectionKey(file)
  fileRegistry.delete(key)
}

export function isFileSelected(file) {
  return selectedFiles.value.some(
    entry => entry.key === fileSelectionKey(file)
  )
}

export function clearFileSelection() {
  selectedFiles.value = []
  lastSelectedKey = null
  currentScope = null
  selectionOwnerId.value = null
}

function addFileToSelection(file) {
  const key = fileSelectionKey(file)

  if (!selectedFiles.value.some(item => item.key === key)) {
    selectedFiles.value = [
      ...selectedFiles.value,
      { key, file }
    ]
  }
}

export function selectFileCard(file, event, ownerId) {
  if (!file || file.id == null) return

  // 카드의 버튼, 메뉴 등에서는 선택 처리하지 않음
  if (
    event.target.closest(
      'button, a, input, select, textarea, [role="menu"]'
    )
  ) {
    return
  }

  const card = event.currentTarget

  const scope =
    card.closest('[data-file-selection-scope]') ||
    card.closest('.asset-grid, .file-grid') ||
    card.parentElement

  // 다른 영역으로 이동했다면 기존 선택 해제
  if (currentScope && currentScope !== scope) {
    clearFileSelection()
  }

  currentScope = scope
  selectionOwnerId.value = ownerId

  const key = fileSelectionKey(file)
  const ctrl = event.ctrlKey || event.metaKey
  const shift = event.shiftKey

  // Shift + 클릭: 같은 그리드 안에서 범위 선택
  if (shift && lastSelectedKey && scope) {
    const cards = Array.from(
      scope.querySelectorAll('[data-file-select-key]')
    )

    const keys = cards.map(
      element => element.dataset.fileSelectKey
    )

    const start = keys.indexOf(lastSelectedKey)
    const end = keys.indexOf(key)

    if (start !== -1 && end !== -1) {
      if (!ctrl) {
        selectedFiles.value = []
      }

      const from = Math.min(start, end)
      const to = Math.max(start, end)

      keys.slice(from, to + 1).forEach(cardKey => {
        const targetFile = fileRegistry.get(cardKey)

        if (targetFile) {
          addFileToSelection(targetFile)
        }
      })

      return
    }
  }

  // Ctrl 또는 Command + 클릭: 다중 선택
  if (ctrl) {
    if (isFileSelected(file)) {
      selectedFiles.value = selectedFiles.value.filter(
        entry => entry.key !== key
      )
    } else {
      addFileToSelection(file)
    }

    lastSelectedKey = key
    return
  }

  // 일반 클릭: 단일 선택 / 다시 클릭하면 해제
  if (
    selectedFiles.value.length === 1 &&
    selectedFiles.value[0].key === key
  ) {
    clearFileSelection()
    return
  }

  selectedFiles.value = [{ key, file }]
  lastSelectedKey = key
}

export function openSelectionDelete() {
  if (!selectedFiles.value.length) return

  isSelectionDeleteOpen.value = true
}

export function closeSelectionDelete() {
  isSelectionDeleteOpen.value = false
}

// 실제 휴지통 이동
export function confirmSelectionDelete() {
  if (!selectedFiles.value.length) return false

  try {
    for (const entry of selectedFiles.value) {
      const file = entry.file

      const parentFolder = folderList.value.find(
        folder =>
          String(folder.id) === String(file.folderId)
      )

      const success = moveToTrash(file, 'file', {
        originalLocation:
          parentFolder?.name ||
          file.folderName ||
          '홈 파일'
      })

      if (!success) {
        throw new Error(
          `${file.name} 파일을 휴지통으로 이동하지 못했습니다.`
        )
      }
    }

    closeSelectionDelete()
    clearFileSelection()
    return true
  } catch (error) {
    console.error('선택 파일 삭제 오류:', error)

    alert(
      error?.message ||
      '파일을 휴지통으로 이동하지 못했습니다.'
    )

    return false
  }
}

// 입력 도중 Delete 키를 눌러도 삭제창이 뜨지 않도록
function isTypingTarget(target) {
  if (!(target instanceof Element)) return false

  return Boolean(
    target.closest(
      'input, textarea, select, [contenteditable="true"], [role="textbox"]'
    )
  )
}

function handleSelectionKeydown(event) {
  if (isTypingTarget(event.target)) return

  // 다른 모달이 열려 있으면 Delete 단축키 차단
  if (
    !isSelectionDeleteOpen.value &&
    document.querySelector(
      '[aria-modal="true"], .modal-overlay, .delete-modal-overlay'
    )
  ) {
    return
  }

  if (event.key === 'Escape') {
    if (isSelectionDeleteOpen.value) {
      closeSelectionDelete()
    } else if (selectedFiles.value.length) {
      clearFileSelection()
    }

    return
  }

  if (
    event.key === 'Delete' &&
    selectedFiles.value.length &&
    !event.repeat
  ) {
    event.preventDefault()

    if (!isSelectionDeleteOpen.value) {
      openSelectionDelete()
    }
  }
}

// 모든 카드가 공유하는 키보드 이벤트
if (typeof document !== 'undefined') {
  document.addEventListener(
    'keydown',
    handleSelectionKeydown
  )
}
