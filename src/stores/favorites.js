
import { ref, watch } from 'vue'

const STORAGE_KEY = 'cherry-design-favorites'

// 저장된 즐겨찾기 불러오기
function loadFavorites() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    const parsed = saved ? JSON.parse(saved) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// 모든 화면에서 공유할 즐겨찾기 목록
export const favoriteFiles = ref(loadFavorites())

// 파일이 즐겨찾기되어 있는지 확인
export function isFavorite(folderId, fileId) {
  return favoriteFiles.value.some(
    item =>
      String(item.folderId) === String(folderId) &&
      String(item.id) === String(fileId)
  )
}

// 즐겨찾기 추가 / 해제
export function toggleFavorite(file, folder) {
  if (!file || !folder) return

  if (isFavorite(folder.id, file.id)) {
    favoriteFiles.value = favoriteFiles.value.filter(
      item =>
        !(
          String(item.folderId) === String(folder.id) &&
          String(item.id) === String(file.id)
        )
    )
  } else {
    favoriteFiles.value.push({
      ...file,
      folderId: folder.id,
      folderName: folder.name
    })
  }
}

// 즐겨찾기 변경 시 브라우저에 저장
watch(
  favoriteFiles,
  (items) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.error('즐겨찾기 저장 실패:', error)
    }
  },
  { deep: true }
)
