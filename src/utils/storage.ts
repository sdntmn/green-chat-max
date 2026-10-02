/**
 * Утилиты для безопасной работы с localStorage.
 */

/** Читает и парсит значение из localStorage. При ошибке возвращает null. */
export const loadFromStorage = <T,>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

/** Записывает значение в localStorage; null удаляет ключ. Ошибки игнорируются. */
export const saveToStorage = <T,>(key: string, value: T | null) => {
  try {
    if (value === null) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, JSON.stringify(value))
    }
  } catch {
    // localStorage недоступен — игнорируем
  }
}