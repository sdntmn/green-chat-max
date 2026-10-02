// api.green-api.com поддерживает CORS для прямых запросов из браузера
const API_URL: string = import.meta.env.VITE_API_URL || 'https://api.green-api.com'

export interface Credentials {
  idInstance: string
  apiTokenInstance: string
}

export interface SendMessageResult {
  idMessage: string
}

export interface TextMessageData {
  textMessage?: string
  isForwarded?: boolean
  forwardingScore?: number
}

export interface NotificationBody {
  typeWebhook?: string
  instanceData?: {
    idInstance: number
    wid?: string
    typeInstance?: string
  }
  timestamp?: number
  idMessage?: string
  senderData?: {
    chatId?: string
    chatName?: string
    chatType?: string
    sender?: string
    senderName?: string
  }
  messageData?: {
    typeMessage?: string
    textMessageData?: TextMessageData
  }
}

export interface Notification {
  receiptId: number | string
  body: NotificationBody | null
}

/** Ответ getStateInstance: 'notAuthorized' | 'authorized' | 'blocked' | 'sleepMode' | 'starting'. */
export interface StateInstanceResponse {
  stateInstance: string
}

/**
 * Собирает URL метода GREEN-API.
 * Пример: https://green-api.com/v3/waInstance1101000000/sendMessage/d75b3a66...
 */
const methodUrl = (
  idInstance: string,
  apiTokenInstance: string,
  method: string,
  suffix = '',
): string =>
  `${API_URL}/waInstance${idInstance}/${method}/${apiTokenInstance}${suffix}`

/** Парсит ответ API, при ошибке выбрасывает Error с текстом из тела ответа. */
const parseResponse = async <T>(res: Response): Promise<T | null> => {
  const text = await res.text()
  let data: T | null = null
  try {
    data = text ? (JSON.parse(text) as T) : null
  } catch {
    data = null
  }
  if (!res.ok) {
    const body = data as { message?: string; error?: string } | null
    const message =
      body?.message || body?.error || `Ошибка запроса (HTTP ${res.status})`
    throw new Error(message)
  }
  return data
}

/**
 * Проверка состояния инстанса.
 * GET /waInstance{idInstance}/getStateInstance/{apiTokenInstance}
 */
export const getStateInstance = async ({
  idInstance,
  apiTokenInstance,
}: Credentials): Promise<StateInstanceResponse | null> => {
  const res = await fetch(methodUrl(idInstance, apiTokenInstance, 'getStateInstance'))
  return parseResponse<StateInstanceResponse>(res)
}

/**
 * Отправка текстового сообщения.
 * POST /waInstance{idInstance}/sendMessage/{apiTokenInstance}
 * body: { chatId, message }
 */
export const sendMessage = async ({
  idInstance,
  apiTokenInstance,
  chatId,
  message,
}: Credentials & { chatId: string; message: string }): Promise<SendMessageResult | null> => {
  const res = await fetch(methodUrl(idInstance, apiTokenInstance, 'sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  })
  return parseResponse<SendMessageResult>(res)
}

/**
 * Получение одного входящего уведомления из очереди.
 * GET /waInstance{idInstance}/receiveNotification/{apiTokenInstance}?receiveTimeout=5
 * Возвращает null, если уведомлений нет, либо { receiptId, body }.
 */
export const receiveNotification = async ({
  idInstance,
  apiTokenInstance,
  receiveTimeout = 5,
}: Credentials & { receiveTimeout?: number }): Promise<Notification | null> => {
  const res = await fetch(
    `${methodUrl(idInstance, apiTokenInstance, 'receiveNotification')}?receiveTimeout=${receiveTimeout}`,
  )
  return parseResponse<Notification>(res)
}

/**
 * Подтверждение обработки уведомления (обязательно после receiveNotification).
 * DELETE /waInstance{idInstance}/deleteNotification/{apiTokenInstance}/{receiptId}
 */
export const deleteNotification = async ({
  idInstance,
  apiTokenInstance,
  receiptId,
}: Credentials & { receiptId: number | string }): Promise<null> => {
  const res = await fetch(
    methodUrl(idInstance, apiTokenInstance, 'deleteNotification', `/${receiptId}`),
    { method: 'DELETE' },
  )
  return parseResponse<null>(res)
}

/**
 * Настраивает инстанс для получения уведомлений по технологии HTTP API:
 * пустой webhookUrl + включённые incoming/outgoing/state webhook'и.
 * POST /waInstance{idInstance}/setSettings/{apiTokenInstance}
 */
export const setSettings = async ({
  idInstance,
  apiTokenInstance,
}: Credentials): Promise<{ saveSettings: boolean } | null> => {
  const res = await fetch(methodUrl(idInstance, apiTokenInstance, 'setSettings'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      webhookUrl: '',
      outgoingWebhook: 'yes',
      stateWebhook: 'yes',
      incomingWebhook: 'yes',
    }),
  })
  return parseResponse<{ saveSettings: boolean }>(res)
}