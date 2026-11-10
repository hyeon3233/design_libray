
import { ref, computed } from 'vue'
import { folderList } from './folders'

const TRASH_KEY = 'cherry-design-trash-v2'
const PERMANENT_KEY = 'cherry-design-permanent-v2'

const DB_NAME = 'cherry-design-archive'
const DB_VERSION = 2
const FILE_STORE = 'uploaded-files'
const FOLDER_STORE = 'uploaded-folders'

function readStorage(key) {
  try {
    const value = JSON.parse(
      localStorage.getItem(key) || '[]'
    )

    return Array.isArray(value) ? value : []
  } catch (error) {
    console.error('저장된 데이터 읽기 실패:', error)
    return []
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export const trashItems = ref(readStorage(TRASH_KEY))

const permanentKeys = ref(
  readStorage(PERMANENT_KEY)
)

export const trashCount = computed(
  () => trashItems.value.length
)

export const trashFolderCount = computed(
  () => trashItems.value.filter(
    item => item.kind === 'folder'
  ).length
)

export const trashFileCount = computed(
  () => trashItems.value.filter(
    item => item.kind === 'file'
  ).length
)

// uploadedFiles.js에서 등록할 반응형 파일 목록
let uploadedFilesRef = null

export function registerUploadedFilesRef(filesRef) {
  uploadedFilesRef = filesRef
}

// 항목마다 고유한 키 생성
export function getTrashKey(kind, item) {
  if (kind === 'folder') {
    return `folder:${String(item.id)}`
  }

  return [
    'file',
    String(item.folderId ?? 'home'),
    String(item.id)
  ].join(':')
}

function hasKey(keys, key) {
  return keys.includes(key)
}

// 휴지통과 영구 삭제 목록에 속한 폴더 ID
function hiddenFolderIds() {
  const ids = new Set()

  for (const entry of [
    ...trashItems.value,
    ...permanentKeys.value
      .filter(item => typeof item === 'object')
  ]) {
    if (entry.kind !== 'folder') continue

    ids.add(String(entry.id))

    for (const folder of entry.folders || []) {
      ids.add(String(folder.id))
    }
  }

  return ids
}

export function isFolderHidden(folderId) {
  if (folderId == null) return false

  return hiddenFolderIds().has(String(folderId))
}

export function isFolderTrashed(folderId) {
  if (folderId == null) return false

  return trashItems.value.some(entry => {
    if (entry.kind !== 'folder') return false

    return (
      String(entry.id) === String(folderId) ||
      (entry.folders || []).some(
        folder => String(folder.id) === String(folderId)
      )
    )
  })
}

export function isTrashed(kind, item) {
  if (!item || item.id == null) return false

  const key = getTrashKey(kind, item)

  return trashItems.value.some(
    entry => entry.key === key
  )
}

export function isFileHidden(file) {
  if (!file || file.id == null) return false

  const key = getTrashKey('file', file)

  return (
    trashItems.value.some(item => item.key === key) ||
    permanentKeys.value.some(item =>
      typeof item === 'string'
        ? item === key
        : item.key === key
    ) ||
    isFolderHidden(file.folderId)
  )
}

export const isFileTrashed = isFileHidden

function getChildFolders(parentIds) {
  const found = []
  const visited = new Set()
  const queue = [...parentIds].map(String)

  while (queue.length) {
    const parentId = queue.shift()

    for (const folder of folderList.value) {
      if (
        String(folder.parentFolderId) !== parentId ||
        visited.has(String(folder.id))
      ) {
        continue
      }

      visited.add(String(folder.id))
      found.push(folder)
      queue.push(String(folder.id))
    }
  }

  return found
}

// URL.createObjectURL로 만든 URL은
// 저장 후 새로고침하면 사용할 수 없으므로 제외
function safeThumbnail(value) {
  if (typeof value !== 'string') return ''

  if (
    value.startsWith('blob:') ||
    value.startsWith('data:')
  ) {
    return ''
  }

  return value
}

function snapshotFolder(folder) {
  return {
    ...folder,
    thumbnail: safeThumbnail(folder.thumbnail)
  }
}

// ====================================
// 휴지통으로 이동
// ====================================
export function moveToTrash(item, kind, options = {}) {
  if (
    !item ||
    item.id == null ||
    !['folder', 'file'].includes(kind)
  ) {
    throw new Error('삭제할 항목을 확인할 수 없습니다.')
  }

  const key = getTrashKey(kind, item)

  if (isTrashed(kind, item)) {
    return false
  }

  const alreadyDeleted = permanentKeys.value.some(
    entry =>
      (typeof entry === 'string' ? entry : entry.key) === key
  )

  if (alreadyDeleted) return false

  // 폴더는 하위 폴더 정보까지 함께 보관
  const folders = kind === 'folder'
    ? [
        snapshotFolder(item),
        ...getChildFolders([item.id]).map(snapshotFolder)
      ]
    : []

  const entry = {
    key,
    id: item.id,
    kind,
    name: item.name || item.title || '이름 없는 항목',
    folderId: item.folderId ?? null,
    parentFolderId: item.parentFolderId ?? null,
    originalLocation:
      options.originalLocation ||
      item.folderName ||
      (kind === 'folder'
        ? '모든 폴더'
        : '홈 파일'),
    type: item.type || '',
    size: item.size || '',
    thumbnail: safeThumbnail(item.thumbnail),
    deletedAt: new Date().toISOString(),
    deletedBy: options.deletedBy ?? null,
    folders,
    isUploaded: Boolean(item.isUploaded)
  }

  const next = [entry, ...trashItems.value]

  // 저장 성공 후 화면을 변경
  writeStorage(TRASH_KEY, next)
  trashItems.value = next

  // 폴더는 일반 폴더 목록에서 제거
  if (kind === 'folder') {
    const ids = new Set(
      folders.map(folder => String(folder.id))
    )

    folderList.value = folderList.value.filter(
      folder => !ids.has(String(folder.id))
    )
  }

  return true
}

// ====================================
// 복원
// ====================================
export function restoreFromTrash(keys) {
  const keySet = new Set(
    (Array.isArray(keys) ? keys : [keys]).map(String)
  )

  const restoring = trashItems.value.filter(
    item => keySet.has(String(item.key))
  )

  if (!restoring.length) return false

  // 상위 폴더가 여전히 삭제 상태인지 검사
  for (const item of restoring) {
    const parentId = item.kind === 'folder'
      ? item.parentFolderId
      : item.folderId

    if (
      parentId != null &&
      !restoring.some(
        folder =>
          folder.kind === 'folder' &&
          (folder.folders || []).some(
            child => String(child.id) === String(parentId)
          )
      ) &&
      isFolderHidden(parentId)
    ) {
      throw new Error(
        '원래 위치의 폴더가 휴지통에 있습니다. 상위 폴더를 먼저 복원해 주세요.'
      )
    }
  }

  const next = trashItems.value.filter(
    item => !keySet.has(String(item.key))
  )

  writeStorage(TRASH_KEY, next)
  trashItems.value = next

  // 폴더를 원래 목록으로 되돌리기
  for (const entry of restoring) {
    if (entry.kind !== 'folder') continue

    for (const folder of entry.folders || []) {
      const exists = folderList.value.some(
        current => String(current.id) === String(folder.id)
      )

      if (!exists) {
        folderList.value.push({ ...folder })
      }
    }
  }

  return true
}

// ====================================
// IndexedDB에서 영구 삭제
// ====================================
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(
      DB_NAME,
      DB_VERSION
    )

    request.onupgradeneeded = () => {
      const db = request.result

      if (!db.objectStoreNames.contains(FILE_STORE)) {
        db.createObjectStore(FILE_STORE, {
          keyPath: 'id'
        })
      }

      if (!db.objectStoreNames.contains(FOLDER_STORE)) {
        db.createObjectStore(FOLDER_STORE, {
          keyPath: 'id'
        })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
    request.onblocked = () => reject(
      new Error('데이터베이스가 사용 중입니다.')
    )
  })
}

async function removeUploadedRecords(entries) {
  const folderIds = new Set()
  const fileIds = new Set()

  for (const entry of entries) {
    if (entry.kind === 'file') {
      fileIds.add(String(entry.id))
    } else {
      for (const folder of entry.folders || []) {
        folderIds.add(String(folder.id))
      }
    }
  }

  if (!folderIds.size && !fileIds.size) return

  const db = await openDatabase()

  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction(
        [FILE_STORE, FOLDER_STORE],
        'readwrite'
      )

      const filesStore = tx.objectStore(FILE_STORE)
      const foldersStore = tx.objectStore(FOLDER_STORE)

      const fileRequest = filesStore.getAll()

      fileRequest.onsuccess = () => {
        for (const file of fileRequest.result) {
          if (
            fileIds.has(String(file.id)) ||
            folderIds.has(String(file.folderId))
          ) {
            filesStore.delete(file.id)
            fileIds.add(String(file.id))
          }
        }
      }

      const folderRequest = foldersStore.getAll()

      folderRequest.onsuccess = () => {
        for (const folder of folderRequest.result) {
          if (folderIds.has(String(folder.id))) {
            foldersStore.delete(folder.id)
          }
        }
      }

      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
  } finally {
    db.close()
  }

  // 현재 실행 중인 화면의 업로드 파일 목록에서도 제거
  if (uploadedFilesRef) {
    uploadedFilesRef.value = uploadedFilesRef.value.filter(
      file => !fileIds.has(String(file.id))
    )
  }
}

// ====================================
// 영구 삭제
// ====================================
export async function permanentlyDelete(keys) {
  const keySet = new Set(
    (Array.isArray(keys) ? keys : [keys]).map(String)
  )

  const deleting = trashItems.value.filter(
    entry => keySet.has(String(entry.key))
  )

  if (!deleting.length) return false

  // 정적 샘플 폴더/파일은 프로젝트 코드에 남아
  // 있으므로 영구 삭제 기록으로 계속 숨긴다.
  const nextPermanent = [
    ...permanentKeys.value,
    ...deleting.map(entry => ({
      key: entry.key,
      id: entry.id,
      kind: entry.kind,
      folders: entry.folders || []
    }))
  ]

  // 삭제 기록 저장 후 IndexedDB 데이터 정리
  writeStorage(PERMANENT_KEY, nextPermanent)
  permanentKeys.value = nextPermanent

  await removeUploadedRecords(deleting)

  const nextTrash = trashItems.value.filter(
    entry => !keySet.has(String(entry.key))
  )

  writeStorage(TRASH_KEY, nextTrash)
  trashItems.value = nextTrash

  return true
}

// ====================================
// 초기화: 삭제된 기본 폴더 숨기기
// ====================================
export function synchronizeTrashedFolders() {
  folderList.value = folderList.value.filter(
    folder => !isFolderHidden(folder.id)
  )
}

// 페이지를 다시 열었을 때도 삭제된 폴더 숨김
synchronizeTrashedFolders()
