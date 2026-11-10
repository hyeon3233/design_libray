
import { ref } from 'vue'
import { folderList } from './folders'
import {
  registerUploadedFilesRef,
  isFolderHidden
} from './trash'

const DB_NAME = 'cherry-design-archive'
const DB_VERSION = 2
const FILE_STORE = 'uploaded-files'
const FOLDER_STORE = 'uploaded-folders'

export const uploadedFiles = ref([])
registerUploadedFilesRef(uploadedFiles)

let dbPromise = null
const previewUrls = new Map()

function openDatabase() {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

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
    request.onblocked = () =>
      reject(new Error('데이터베이스가 다른 탭에서 사용 중입니다.'))
  }).catch(error => {
    dbPromise = null
    throw error
  })

  return dbPromise
}

function readAll(db, storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const request = tx.objectStore(storeName).getAll()

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes}B`

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)}KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

function today() {
  const date = new Date()

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}.${month}.${day}`
}

function isImage(blob) {
  return blob &&
    ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
      .includes(blob.type)
}

function toDisplayFile(record) {
  let thumbnail = ''

  if (isImage(record.blob)) {
    thumbnail = URL.createObjectURL(record.blob)
    previewUrls.set(record.id, thumbnail)
  }

  return {
    id: record.id,
    folderId: record.folderId,
    name: record.name,
    originalName: record.originalName || record.name,
    type: record.type,
    size: record.size,
    uploadedAt: record.uploadedAt,
    updatedAt: null,
    tags: record.tags || [],
    description: record.description || '',
    color: '#F5E9F0',
    thumbnail,
    isUploaded: true
  }
}

// 기존에 저장한 파일 및 하위 폴더 복원
export async function loadUploadedFiles() {
  const db = await openDatabase()

  const [files, folders] = await Promise.all([
    readAll(db, FILE_STORE),
    readAll(db, FOLDER_STORE)
  ])

  
// 저장된 하위 폴더 복원
for (const folder of folders) {
  // 휴지통 또는 영구 삭제된 폴더는 표시하지 않음
  if (isFolderHidden(folder.id)) {
    continue
  }

  const exists = folderList.value.some(
    item => String(item.id) === String(folder.id)
  )

  if (!exists) {
    folderList.value.push(folder)
  }
}


  // 기존 썸네일 URL 정리
  previewUrls.forEach(url => URL.revokeObjectURL(url))
  previewUrls.clear()

  uploadedFiles.value = files.map(toDisplayFile)
}

// 화면에서 공유하는 초기화 Promise
export const uploadedFilesReady = loadUploadedFiles()
  .catch(error => {
    console.error('저장된 파일 불러오기 실패:', error)
    throw error
  })

// 업로드 요청을 실제로 저장
export async function saveUpload(payload, targetFolder) {
  if (!targetFolder?.id) {
    throw new Error('업로드할 폴더를 선택해 주세요.')
  }

  if (!payload?.items?.length) {
    throw new Error('업로드할 파일이나 폴더가 없습니다.')
  }

  // 기존 파일 불러오기가 끝난 후 업로드 시작
  await uploadedFilesReady

  const db = await openDatabase()

  const newFolders = []
  const newFiles = []

  const usedIds = new Set(
    folderList.value.map(folder => String(folder.id))
  )

  function uniqueFolderId() {
    let id

    do {
      id = crypto.randomUUID()
    } while (usedIds.has(id))

    usedIds.add(id)
    return id
  }

  // 이번 업로드에 포함된 폴더 구조 생성
  for (const item of payload.items) {
    const folderPaths = new Set(item.folderPaths || [])

    // 파일 경로에 나타난 폴더도 추출
    for (const entry of item.files || []) {
      const parts = (entry.relativePath || entry.file.name)
        .split('/')
        .filter(Boolean)

      for (let i = 1; i < parts.length; i++) {
        folderPaths.add(parts.slice(0, i).join('/'))
      }
    }

    const pathIdMap = new Map()

    // 상위 폴더부터 생성
    const sortedPaths = [...folderPaths].sort(
      (a, b) =>
        a.split('/').length - b.split('/').length
    )

    for (const path of sortedPaths) {
      const parts = path.split('/')
      const name = parts[parts.length - 1]

      const parentPath = parts.slice(0, -1).join('/')

      const parentId = parentPath
        ? pathIdMap.get(parentPath)
        : targetFolder.id

      if (parentId == null) {
        throw new Error(
          `${path}의 상위 폴더를 찾지 못했습니다.`
        )
      }

      const id = uniqueFolderId()

      const folderRecord = {
        id,
        parentFolderId: parentId,
        name,
        description: '',
        category: targetFolder.category || '기타',
        color: '#E9F2FF',
        thumbnail: '',
        fileCount: 0,
        updatedAt: today()
      }

      newFolders.push(folderRecord)
      pathIdMap.set(path, id)
    }

    // 실제 파일 정보 생성
    for (const entry of item.files || []) {
      const file = entry.file

      if (!file) continue

      // 파일당 최대 100MB
      if (file.size > 100 * 1024 * 1024) {
        throw new Error(
          `${file.name}: 100MB 이하 파일만 업로드할 수 있어요.`
        )
      }

      const parts = (
        entry.relativePath || file.name
      ).split('/').filter(Boolean)

      const parentPath = parts.slice(0, -1).join('/')

      const folderId = parentPath
        ? pathIdMap.get(parentPath)
        : targetFolder.id

      if (folderId == null) {
        throw new Error(
          `${file.name}의 저장 폴더를 찾지 못했습니다.`
        )
      }

      const extension = file.name.includes('.')
        ? file.name.split('.').pop().toUpperCase()
        : 'FILE'

      const isSingleFile =
        payload.items.length === 1 &&
        item.kind === 'file' &&
        item.files.length === 1

      newFiles.push({
        id: crypto.randomUUID(),
        folderId,
        name: isSingleFile && payload.title
          ? payload.title
          : file.name,
        originalName: file.name,
        type: extension,
        size: formatSize(file.size),
        uploadedAt: today(),
        tags: [...(payload.tags || [])],
        description: payload.description || '',
        blob: file
      })
    }
  }

  if (!newFiles.length && !newFolders.length) {
    throw new Error('저장할 항목이 없습니다.')
  }

  // 파일과 폴더를 한 트랜잭션에서 저장
  await new Promise((resolve, reject) => {
    const tx = db.transaction(
      [FILE_STORE, FOLDER_STORE],
      'readwrite'
    )

    const fileStore = tx.objectStore(FILE_STORE)
    const folderStore = tx.objectStore(FOLDER_STORE)

    for (const folder of newFolders) {
      folderStore.put(folder)
    }

    for (const file of newFiles) {
      fileStore.put(file)
    }

    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(
      tx.error || new Error('업로드 저장 실패')
    )
    tx.onabort = () => reject(
      tx.error || new Error('업로드가 취소되었습니다.')
    )
  })

  // 저장 성공 후 화면 데이터 갱신
  folderList.value.push(...newFolders)

  uploadedFiles.value.push(
    ...newFiles.map(toDisplayFile)
  )

  return {
    files: newFiles.length,
    folders: newFolders.length
  }
}
