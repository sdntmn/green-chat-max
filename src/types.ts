export interface Message {
  id: string
  text: string
  timestamp: number
  direction: 'outgoing' | 'incoming'
}

export interface Chat {
  chatId: string
  displayPhone: string
  createdAt: number
}