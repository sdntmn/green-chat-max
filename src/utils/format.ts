/**
 * Время сообщения в виде ЧЧ:ММ, например «14:05».
 */
export const formatTime = (timestamp: number): string => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Короткая метка дня для разделителей: «Сегодня», «Вчера» или «12 мар.».
 */
export const formatDay = (timestamp: number): string => {
  if (!timestamp) return ''
  const d = new Date(timestamp)
  const today = new Date()
  const startOfDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  const diffDays = Math.round((startOfDay(today) - startOfDay(d)) / 86400000)

  if (diffDays === 0) return 'Сегодня'
  if (diffDays === 1) return 'Вчера'
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}