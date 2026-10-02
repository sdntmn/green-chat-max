import { formatTime } from '../utils/format'
import type { Message } from '../types'

interface Props {
  message: Message
}

export const MessageBubble = ({ message }: Props) => {
  const isOutgoing = message.direction === 'outgoing'

  return (
    <div
      className={`message-row ${isOutgoing ? 'message-row--outgoing' : 'message-row--incoming'}`}
    >
      <div
        className={`message-bubble ${
          isOutgoing ? 'message-bubble--outgoing' : 'message-bubble--incoming'
        }`}
      >
        <span className="message-text">{message.text}</span>
        <span className="message-time">{formatTime(message.timestamp)}</span>
      </div>
    </div>
  )
}