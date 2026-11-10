
import { ref, watch } from 'vue'

const STORAGE_KEY = 'cherry-archive-theme'

function getSavedTheme() {
  if (typeof window === 'undefined') {
    return 'light'
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    return saved === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export const currentTheme = ref(getSavedTheme())

export function applyTheme(theme = currentTheme.value) {
  const nextTheme = theme === 'dark' ? 'dark' : 'light'

  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute(
      'data-theme',
      nextTheme
    )

    document.documentElement.style.colorScheme =
      nextTheme
  }
}

export function setTheme(theme) {
  if (theme !== 'light' && theme !== 'dark') {
    return
  }

  currentTheme.value = theme

  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch (error) {
    console.warn('테마 저장 실패:', error)
  }

  applyTheme(theme)
}

export function toggleTheme() {
  setTheme(
    currentTheme.value === 'light'
      ? 'dark'
      : 'light'
  )
}

// 처음 사이트를 열었을 때 저장된 테마 적용
applyTheme()

watch(currentTheme, theme => {
  applyTheme(theme)
})
