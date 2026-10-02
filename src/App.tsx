import { useEffect, useState } from 'react'
import {
  getStateInstance,
  sendMessage,
  setSettings,
  type Credentials,
  type NotificationBody,
} from './api/greenApi'
import { STORAGE_KEYS } from './constants'
import { useMessagePolling } from './hooks/useMessagePolling'
import { LoginScreen } from './components/LoginScreen'
import { ChatScreen } from './components/ChatScreen'
import { loadFromStorage, saveToStorage } from './utils/storage'
import type { Chat, Message } from './types'
import './App.css'

export const App = () => {
  const [credentials, setCredentials] = useState<Credentials | null>(() =>
    loadFromStorage<Credentials>(STORAGE_KEYS.credentials),
  )
  const [instanceState, setInstanceState] = useState<string | null>(null)
  const [pollError, setPollError] = useState<string | null>(null)
  const [chat, setChat] = useState<Chat | null>(() =>
    loadFromStorage<Chat>(STORAGE_KEYS.chat),
  )
  const [messages, setMessages] = useState<Message[]>(() =>
    loadFromStorage<Message[]>(STORAGE_KEYS.messages) ?? [],
  )

  // Персистентность сессии и истории
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.credentials, credentials)
  }, [credentials])

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.chat, chat)
    if (!chat) saveToStorage(STORAGE_KEYS.messages, null)
  }, [chat])

  useEffect(() => {
    if (chat) saveToStorage(STORAGE_KEYS.messages, messages)
  }, [chat, messages])

  // При восстановлении сессии из localStorage актуализируем статус инстанса
  useEffect(() => {
    if (!credentials || instanceState) return
    void getStateInstance(credentials)
      .then((state) => {
        if (state?.stateInstance) setInstanceState(state.stateInstance)
      })
      .catch(() => {
        // статус недоступен — оставляем «подключение…»
      })
  }, [credentials, instanceState])

  const handleLogin = (creds: Credentials, stateInstance: string) => {
    setCredentials(creds)
    setInstanceState(stateInstance)
    // Включаем получение входящих уведомлений по технологии HTTP API.
    // Ошибка не блокирует вход — настройки можно включить в личном кабинете.
    void setSettings(creds).catch(() => {
      // настройки инстанса недоступны — продолжаем работу
    })
  }

  const handleCreateChat = (chatId: string) => {
    setChat({ chatId, displayPhone: chatId, createdAt: Date.now() })
    setMessages([])
  }

  const handleSend = async (text: string) => {
    if (!credentials || !chat) {
      throw new Error('Чат не создан')
    }
    const result = await sendMessage({
      ...credentials,
      chatId: chat.chatId,
      message: text,
    })
    if (!result?.idMessage) {
      throw new Error('Сервис GREEN-API не вернул идентификатор сообщения')
    }
    setMessages((prev) => [
      ...prev,
      { id: result.idMessage, text, timestamp: Date.now(), direction: 'outgoing' },
    ])
  }

  const handleIncoming = (body: NotificationBody) => {
    if (!chat) return
    const incomingChatId = body.senderData?.chatId
    // Показываем только сообщения из активного чата
    if (!incomingChatId || incomingChatId !== chat.chatId) return
    const text = body.messageData?.textMessageData?.textMessage
    if (!text) return

    const timestamp = (body.timestamp ?? Math.floor(Date.now() / 1000)) * 1000
    setMessages((prev) => {
      // Дедупликация по idMessage на случай повторной доставки уведомления
      if (body.idMessage && prev.some((m) => m.id === body.idMessage)) return prev
      return [
        ...prev,
        {
          id: body.idMessage ?? `in-${timestamp}`,
          text,
          timestamp,
          direction: 'incoming',
        },
      ]
    })
  }

  useMessagePolling({
    idInstance: credentials?.idInstance ?? '',
    apiTokenInstance: credentials?.apiTokenInstance ?? '',
    enabled: Boolean(credentials && chat),
    onIncomingMessage: handleIncoming,
    onError: (error) => setPollError(error.message),
  })

  const handleLogout = () => {
    setCredentials(null)
    setInstanceState(null)
    setChat(null)
    setMessages([])
  }

  if (!credentials) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <ChatScreen
      chat={chat}
      messages={messages}
      instanceState={instanceState}
      pollError={pollError}
      onSend={handleSend}
      onCreateChat={handleCreateChat}
      onLogout={handleLogout}
    />
  )
}

export default App