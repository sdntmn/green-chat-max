import { useEffect, useRef } from 'react'
import {
  deleteNotification,
  receiveNotification,
  type Credentials,
  type NotificationBody,
} from '../api/greenApi'

interface UseMessagePollingOptions extends Credentials {
  /** Опрос активен только при включённом флаге (после входа). */
  enabled: boolean
  /** Вызывается для каждого входящего текстового сообщения. */
  onIncomingMessage: (body: NotificationBody) => void
  /** Вызывается при ошибке запроса к GREEN-API. */
  onError?: (error: Error) => void
}

/**
 * Циклически получает входящие уведомления по технологии HTTP API:
 * receiveNotification → обработка → deleteNotification → пауза → повтор.
 * Рекурсивный setTimeout исключает наложение запросов друг на друга.
 */
export const useMessagePolling = ({
  idInstance,
  apiTokenInstance,
  enabled,
  onIncomingMessage,
  onError,
}: UseMessagePollingOptions) => {
  const onIncomingMessageRef = useRef(onIncomingMessage)
  onIncomingMessageRef.current = onIncomingMessage

  const onErrorRef = useRef(onError)
  onErrorRef.current = onError

  useEffect(() => {
    if (!enabled) return

    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const poll = async () => {
      try {
        const notification = await receiveNotification({
          idInstance,
          apiTokenInstance,
          receiveTimeout: 5,
        })

        if (!cancelled && notification?.receiptId != null) {
          const body = notification.body
          if (
            body?.typeWebhook === 'incomingMessageReceived' &&
            body.messageData?.typeMessage === 'textMessage'
          ) {
            onIncomingMessageRef.current(body)
          }
          // Подтверждение обработки уведомления — обязательно, иначе очередь заблокируется
          try {
            await deleteNotification({
              idInstance,
              apiTokenInstance,
              receiptId: notification.receiptId,
            })
          } catch {
            // Уведомление останется в очереди и будет получено повторно — это допустимо
          }
        }
      } catch (err) {
        // Сетевые сбои и лимиты частоты запросов — продолжаем опрос
        const error = err instanceof Error ? err : new Error('Ошибка опроса уведомлений')
        console.error('Ошибка опроса уведомлений GREEN-API:', error)
        onErrorRef.current?.(error)
      } finally {
        if (!cancelled) {
          timer = setTimeout(poll, 1000)
        }
      }
    }

    timer = setTimeout(poll, 0)
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [idInstance, apiTokenInstance, enabled])
}