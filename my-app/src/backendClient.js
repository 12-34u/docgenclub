const configuredApiUrl = import.meta.env.VITE_GENERATOR_API?.trim()
const API_URL = configuredApiUrl || (import.meta.env.DEV ? 'http://localhost:3001' : '')

export const generateTextBackend = async (docType, formData) => {
  if (!API_URL) {
    throw new Error(
      'VITE_GENERATOR_API is not configured. Set it in your deployment environment and redeploy.',
    )
  }

  const response = await fetch(`${API_URL}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ docType, formData }),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Generator API error (${response.status}): ${detail}`)
  }

  const data = await response.json()
  return data.content
}
