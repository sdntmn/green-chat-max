/**
 * Глобальные константы приложения.
 */

export const DEFAULT_ID_INSTANCE: string = import.meta.env.VITE_ID_INSTANCE || ''
export const DEFAULT_API_TOKEN: string = import.meta.env.VITE_API_TOKEN_INSTANCE || ''

/** Ключи localStorage для хранения сессии, чата и истории сообщений. */
export const STORAGE_KEYS = {
  credentials: 'green-chat:credentials',
  chat: 'green-chat:chat',
  messages: 'green-chat:messages',
} as const

/** Описание статуса инстанса GREEN-API для отображения в шапке чата. */
export interface InstanceStatusInfo {
  label: string
  online: boolean
}

export const INSTANCE_STATUS: Record<string, InstanceStatusInfo> = {
  authorized: { label: 'онлайн в MAX', online: true },
  notAuthorized: { label: 'не авторизован — отсканируйте QR-код', online: false },
  blocked: { label: 'аккаунт заблокирован', online: false },
  starting: { label: 'инстанс запускается…', online: false },
  sleepMode: { label: 'инстанс в спящем режиме', online: false },
}

/** Вариант страны для выбора кода телефона. */
export interface Country {
  code: string
  country: string
  flag: string
}

/** Доступные страны для выбора кода (пока только Россия — как в MAX). */
export const COUNTRIES: Country[] = [{ code: '+7', country: 'Россия', flag: '🇷🇺' }]