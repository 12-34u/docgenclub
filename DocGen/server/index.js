import express from 'express'
import cors from 'cors'
import { generateContent, supportedDocTypes } from './generator.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', supportedDocTypes })
})

app.post('/generate', (req, res) => {
  const { docType, formData = {} } = req.body || {}
  if (!docType) {
    return res.status(400).json({ error: 'docType is required', supportedDocTypes })
  }
  try {
    const content = generateContent(docType, formData)
    return res.json({ docType, content })
  } catch (err) {
    return res.status(400).json({ error: err.message, supportedDocTypes })
  }
})

app.listen(PORT, () => {
  console.log(`Generator API running on http://localhost:${PORT}`)
})
