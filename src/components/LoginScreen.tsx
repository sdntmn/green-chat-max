import { useState, type FormEvent } from 'react'
import { getStateInstance, type Credentials } from '../api/greenApi'
import { DEFAULT_API_TOKEN, DEFAULT_ID_INSTANCE } from '../constants';


interface Props {
  onLogin: (credentials: Credentials, stateInstance: string) => void
}

export const LoginScreen = ({ onLogin }: Props) => {
  const [idInstance, setIdInstance] = useState(DEFAULT_ID_INSTANCE)
  const [apiTokenInstance, setApiTokenInstance] = useState(DEFAULT_API_TOKEN)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!idInstance.trim() || !apiTokenInstance.trim()) {
      setError('Заполните оба поля: idInstance и apiTokenInstance')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const credentials: Credentials = {
        idInstance: idInstance.trim(),
        apiTokenInstance: apiTokenInstance.trim(),
      }
      const state = await getStateInstance(credentials)
      if (!state) {
        throw new Error('Не удалось получить состояние инстанса')
      }
      onLogin(credentials, state.stateInstance)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось войти в систему')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
            <path d="M12 3C6.9 3 2.8 6.6 2.8 11c0 2.3 1.1 4.3 2.8 5.7V21l4.1-2.3c.7.2 1.5.3 2.3.3 5.1 0 9.2-3.6 9.2-8S17.1 3 12 3z" />
          </svg>
        </div>
        <h1 className="login-title">MAX</h1>
        <p className="login-subtitle">Вход в чат через GREEN-API</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label">
            <span>idInstance</span>
            <input
              type="text"
              value={idInstance}
              onChange={(e) => setIdInstance(e.target.value)}
              placeholder="Например, 1101000001"
              autoComplete="off"
            />
          </label>
          <label className="login-label">
            <span>apiTokenInstance</span>
            <input
              type="password"
              value={apiTokenInstance}
              onChange={(e) => setApiTokenInstance(e.target.value)}
              placeholder="Токен из личного кабинета GREEN-API"
              autoComplete="off"
            />
          </label>

          {error && <div className="login-error">{error}</div>}

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? 'Проверка…' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  )
}