type ApiEnv = {
  VITE_API_URL?: string
}

const DEFAULT_API_URL = '/api'

const normalizeApiUrl = (value: string) => value.replace(/\/+$/, '') || DEFAULT_API_URL

export const resolveApiUrl = (env: ApiEnv = import.meta.env) => {
  const configuredUrl = env.VITE_API_URL?.trim()

  return configuredUrl ? normalizeApiUrl(configuredUrl) : DEFAULT_API_URL
}

const API_URL = resolveApiUrl()

export const fetchApi = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem('token')
  const headers = new Headers(options.headers || {})
  headers.set('Content-Type', 'application/json')

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Error en la petición')
  }

  return data
}
