# MAX Chat — чат-клиент через GREEN-API

Пользовательский интерфейс для отправки и получения **текстовых сообщений** в мессенджере
[MAX](https://web.max.ru/) через сервис [GREEN-API](https://green-api.com/max).

## Возможности

- Экран входа с полями `idInstance` и `apiTokenInstance` (предзаполняются из `.env`),
  проверка учётных данных через метод [`getStateInstance`](https://green-api.com/v3/docs/api/service/GetStateInstance/).
- Создание чата по номеру телефона получателя (номер приводится к формату `79991234567@c.us`).
- Отправка текстовых сообщений через метод [`SendMessage`](https://green-api.com/v3/docs/api/sending/SendMessage/).
- Получение входящих сообщений по технологии [HTTP API](https://green-api.com/v3/docs/api/receiving/technology-http-api/)
  (циклический опрос `receiveNotification` → обработка → `deleteNotification`).
- Отображение статуса инстанса (авторизован / не авторизован и т.д.).
- Сохранение сессии, чата и истории сообщений в `localStorage`.
- Светлая тема в стиле MAX: синие пузыри своих сообщений, белые — входящих.

## Технологии

- React 19 + TypeScript
- Vite 8
- react-icons
- Чистые `fetch`-запросы к GREEN-API (без дополнительных HTTP-клиентов)

## Запуск

```bash
npm install
npm run dev
```

Приложение будет доступно по адресу http://localhost:5173

## Настройка

Учётные данные инстанса GREEN-API указываются в файле `.env`:

```env
VITE_API_URL=https://api.green-api.com
VITE_ID_INSTANCE=1101000001
VITE_API_TOKEN_INSTANCE=ваш-токен
```

> Для прямых запросов из браузера используется домен `api.green-api.com`,
> поддерживающий CORS. Префикс `/v3` в URL необязателен.

## Как пользоваться

1. Откройте приложение — на экране входа будут подставлены значения из `.env`.
   При необходимости введите свои `idInstance` и `apiTokenInstance` и нажмите «Войти».
2. Выберите страну (Россия, +7) и введите номер телефона получателя — маска сама
   отформатирует номер (например, `(999) 123-45-67`). Нажмите «Создать чат».
3. Напишите текстовое сообщение и отправьте его (Enter или кнопка отправки).
4. Ответы собеседника из MAX появятся в ленте автоматически (циклический опрос
   `receiveNotification` → `deleteNotification`).

## Важно: авторизация инстанса

Для реальной отправки и получения сообщений инстанс GREEN-API **должен быть авторизован**
(статус `authorized`). Если инстанс не авторизован (`notAuthorized`), сообщения
отправляются в очередь, но не доставляются, а входящие не приходят.

Проверить/авторизовать инстанс:

1. Откройте [личный кабинет GREEN-API](https://console.green-api.com/)
2. Выберите свой инстанс и отсканируйте QR-код приложением MAX (раздел «Инстансы»)
3. Статус инстанса станет `authorized` — отправка и получение заработают

При входе приложение автоматически включает получение входящих уведомлений по
технологии HTTP API (метод `setSettings`: `webhookUrl: ""`, `incomingWebhook/outgoingWebhook/stateWebhook: "yes"`).
О статусе инстанса всегда видно в шапке чата; если инстанс не авторизован —
показывается предупреждающий баннер со ссылкой на личный кабинет.

## Структура проекта

```
src/
├── api/greenApi.ts          # клиент GREEN-API (getStateInstance, sendMessage,
│                            #   receiveNotification, deleteNotification)
├── components/
│   ├── LoginScreen.tsx      # экран входа
│   ├── ChatScreen.tsx       # создание чата и окно переписки
│   ├── MessageBubble.tsx    # облако сообщения
│   └── Composer.tsx         # поле ввода и отправка
├── hooks/
│   └── useMessagePolling.ts # циклический опрос входящих уведомлений
├── utils/
│   ├── phone.ts             # номер телефона → chatId
│   └── format.ts            # форматирование времени
├── App.tsx                  # корневой компонент и состояние приложения
└── main.tsx                 # точка входа
```

## Проверка

```bash
npx tsc -p tsconfig.json --noEmit   # проверка типов
npm run build                       # production-сборка
```

## Важно

Для реальной отправки/получения сообщений инстанс GREEN-API должен быть авторизован
(статус `authorized`): отсканируйте QR-код в [личном кабинете](https://console.green-api.com/)
или используйте метод [`SetSettings`](https://green-api.com/v3/docs/api/account/SetSettings/)
для включения входящих уведомлений (`incomingWebhook: "yes"`, пустой `webhookUrl`).
