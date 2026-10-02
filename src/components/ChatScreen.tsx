import { useEffect, useRef, useState, type FormEvent } from 'react'
import { IoChevronDown, IoLogOutOutline } from 'react-icons/io5'
import { MessageBubble } from './MessageBubble'
import { Composer } from './Composer'
import { COUNTRIES, INSTANCE_STATUS } from '../constants'
import { toChatId, formatPhone, formatLocalNumber, normalizePhone } from '../utils/phone'
import type { Chat, Message } from '../types'

interface Props {
  chat: Chat | null
  messages: Message[]
  instanceState?: string | null
  pollError?: string | null
  onSend: (text: string) => void | Promise<void>
  onCreateChat: (phone: string) => void
  onLogout: () => void
}

export const ChatScreen = ({
  chat,
  messages,
  instanceState,
  pollError,
  onSend,
  onCreateChat,
  onLogout,
}: Props) => {
  const instanceStatus =
    INSTANCE_STATUS[instanceState ?? ''] ?? { label: 'подключение…', online: false }
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)
  const [countryCode, setCountryCode] = useState<string>(COUNTRIES[0].code)
  const [countryOpen, setCountryOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const handleSendMessage = async (text: string) => {
    try {
      setSendError(null)
      await onSend(text)
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Не удалось отправить сообщение')
    }
  }



  const handlePhoneChange = (value: string) => {
    setPhone(formatLocalNumber(value))
    if (error) setError(null)
  }

  const handleCountrySelect = (code: string) => {
    setCountryCode(code)
    setCountryOpen(false)
  }

  const handleCreateChat = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      // Собираем полный номер: код страны из селектора + локальная часть
      const fullNumber = `${normalizePhone(countryCode)}${normalizePhone(phone)}`
      const chatId = toChatId(fullNumber)
      onCreateChat(chatId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Некорректный номер телефона')
    }
  }

    useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!chat) {
    return (
      <div className="chat-screen">
        <header className="chat-header chat-header--empty">
          <div className="chat-header-brand">
            <div className="chat-logo" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M12 3C6.9 3 2.8 6.6 2.8 11c0 2.3 1.1 4.3 2.8 5.7V21l4.1-2.3c.7.2 1.5.3 2.3.3 5.1 0 9.2-3.6 9.2-8S17.1 3 12 3z" />
              </svg>
            </div>
            <span className="chat-header-title">MAX</span>
          </div>
          <button
            className="chat-header-logout"
            type="button"
            onClick={onLogout}
            aria-label="Выйти из аккаунта"
            title="Выйти"
          >
            <IoLogOutOutline />
          </button>
        </header>

        {!instanceStatus.online && (
          <div className="auth-banner">
            ⚠️ Инстанс не авторизован: отправка и получение сообщений будут недоступны.
            Отсканируйте QR-код в{' '}
            <a
              href="https://console.green-api.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              личном кабинете GREEN-API
            </a>
            .
          </div>
        )}

        <div className="chat-create">
          <div className="chat-create-card">
            <h2 className="chat-create-title">Новый чат</h2>
            <p className="chat-create-text">
              Выберите страну и введите номер телефона получателя
            </p>
            <form className="chat-create-form" onSubmit={handleCreateChat}>
              <div className="phone-field">
                <div className="phone-select-wrap">
                  <button
                    className="phone-select"
                    type="button"
                    onClick={() => setCountryOpen((open) => !open)}
                    aria-haspopup="listbox"
                    aria-expanded={countryOpen}
                  >
                    <span className="phone-select-flag">{COUNTRIES[0].flag}</span>
                    <span className="phone-select-code">{countryCode}</span>
                    <IoChevronDown className="phone-select-caret" />
                  </button>
                  {countryOpen && (
                    <div className="country-dropdown" role="listbox">
                      {COUNTRIES.map((country) => (
                        <button
                          key={country.code}
                          className="country-option country-option--active"
                          type="button"
                          role="option"
                          aria-selected={countryCode === country.code}
                          onClick={() => handleCountrySelect(country.code)}
                        >
                          <span className="country-option-flag">{country.flag}</span>
                          <span className="country-option-name">{country.country}</span>
                          <span className="country-option-code">{country.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  className="chat-create-input"
                  type="tel"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="(999) 123-45-67"
                  autoFocus
                />
              </div>
              {error && <div className="chat-create-error">{error}</div>}
              <button className="chat-create-button" type="submit">
                Создать чат
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // --- Режим переписки ---
  return (
    <div className="chat-screen">
      <header className="chat-header">
        <div className="chat-header-user">
          <div className="chat-avatar" aria-hidden="true">
            {formatPhone(chat.displayPhone).replace(/[^\d]/g, '').slice(-2) || 'MX'}
          </div>
          <div className="chat-header-meta">
            <span className="chat-header-name">{formatPhone(chat.displayPhone)}</span>
            <span
              className={`chat-header-status ${
                instanceStatus.online ? 'chat-header-status--online' : 'chat-header-status--offline'
              }`}
            >
              {instanceStatus.label}
            </span>
          </div>
        </div>
        <button
          className="chat-header-logout"
          type="button"
          onClick={onLogout}
          aria-label="Выйти из аккаунта"
          title="Выйти"
        >
          <IoLogOutOutline />
        </button>
      </header>

      {!instanceStatus.online && (
        <div className="auth-banner">
          ⚠️ Инстанс не авторизован: отправка и получение сообщений будут недоступны.
          Отсканируйте QR-код в{' '}
          <a
            href="https://console.green-api.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            личном кабинете GREEN-API
          </a>
          .
        </div>
      )}

      {pollError && <div className="poll-error">Ошибка опроса уведомлений: {pollError}</div>}

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <p>Сообщений пока нет</p>
            <p className="chat-empty-hint">
              Напишите первое сообщение собеседнику. Ответы из MAX появятся здесь автоматически.
            </p>
          </div>
        )}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {sendError && <div className="composer-error">{sendError}</div>}
      <Composer onSend={handleSendMessage} />
    </div>
  )
}