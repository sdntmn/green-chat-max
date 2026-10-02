import { useState, type FormEvent } from 'react'
import { IoSend } from 'react-icons/io5'

interface Props {
  onSend: (text: string) => void | Promise<void>
  disabled?: boolean
}

export const Composer = ({ onSend, disabled }: Props) => {
  const [text, setText] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    void onSend(trimmed)
    setText('')
  }

  return (
    <form className="composer" onSubmit={handleSubmit}>
      <input
        className="composer-input"
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Написать сообщение…"
        autoFocus
      />
      <button
        className="composer-button"
        type="submit"
        aria-label="Отправить сообщение"
        disabled={!text.trim()}
      >
        <IoSend />
      </button>
    </form>
  )
}