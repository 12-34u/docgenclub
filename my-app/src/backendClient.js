const API_URL = import.meta.env.VITE_GENERATOR_API || 'http://localhost:3001'

export const generateTextBackend = async (docType, formData) => {
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
