/**
 * Оставляет в номере только цифры и приводит локальный код «8» к международному «7».
 */
export const normalizePhone = (input: string | number | undefined | null): string => {
  let digits = String(input ?? '').replace(/\D/g, '')
  if (digits.startsWith('8') && digits.length === 11) {
    digits = `7${digits.slice(1)}`
  }
  return digits
}


export const toChatId = (phone: string): string => {
  let digits = normalizePhone(phone)
  if (digits.length === 0) {
    throw new Error('Введите номер телефона')
  }
  if (digits.length < 10) {
    throw new Error('Номер должен содержать не менее 10 цифр')
  }
  if (digits.length === 10) {
    digits = `7${digits}`
  }
  return `${digits}@c.us`
}

/**
 * Пошагово форматирует номер при вводе: '+7 (999) 123-45-67'.
 * Принимает любые символы, оставляет только цифры и расставляет маску.
 */
export const formatPhoneInput = (value: string): string => {
  let digits = normalizePhone(value).slice(0, 12)
  if (!digits) return ''

  if (digits.startsWith('8')) {
    digits = `7${digits.slice(1)}`
  }

  // Номер без кода страны (до 11 цифр, не начинается с «7»/«1») —
  // считаем российским и подставляем «+7» автоматически
  const hasCountryCode = digits.startsWith('7') || digits.startsWith('1')
  if (!hasCountryCode && digits.length <= 11) {
    digits = `7${digits}`
  }

  // Российские номера: +7 (XXX) XXX-XX-XX
  if (digits[0] === '7') {
    const d = digits.slice(1)
    let out = '+7'
    if (d.length > 0) out += ` (${d.slice(0, 3)}`
    if (d.length >= 4) out += `) ${d.slice(3, 6)}`
    if (d.length >= 7) out += `-${d.slice(6, 8)}`
    if (d.length >= 9) out += `-${d.slice(8, 10)}`
    return out
  }

  // Остальные коды стран: +К XXX XXX-XX-XX
  const d = digits.slice(1)
  let out = `+${digits[0]}`
  if (d.length > 0) out += ` ${d.slice(0, 3)}`
  if (d.length >= 4) out += ` ${d.slice(3, 6)}`
  if (d.length >= 7) out += `-${d.slice(6, 8)}`
  if (d.length >= 9) out += `-${d.slice(8, 10)}`
  return out
}

/**
 * Форматирует локальную часть номера (10 цифр) без кода страны:
 * '(999) 123-45-67'. Если вставили номер с кодом «7»/«8» — код отрезается.
 */
export const formatLocalNumber = (value: string): string => {
  let digits = normalizePhone(value).slice(0, 10)
  if (digits.length === 11 && (digits[0] === '7' || digits[0] === '8')) {
    digits = digits.slice(1)
  }
  if (!digits) return ''

  let out = ''
  if (digits.length > 0) out += `(${digits.slice(0, 3)}`
  if (digits.length >= 4) out += `) ${digits.slice(3, 6)}`
  if (digits.length >= 7) out += `-${digits.slice(6, 8)}`
  if (digits.length >= 9) out += `-${digits.slice(8, 10)}`
  return out
}

/**
 * Приводит chatId или номер к читаемому виду: '+7 999 123-45-67'.
 */
export const formatPhone = (phoneOrChatId: string | number): string => {
  const digits = normalizePhone(phoneOrChatId)
  if (digits.length !== 11) {
    return String(phoneOrChatId)
  }
  const country = digits[0]
  const rest = digits.slice(1)
  return `+${country} ${rest.slice(0, 3)} ${rest.slice(3, 6)}-${rest.slice(6, 8)}-${rest.slice(8)}`
}