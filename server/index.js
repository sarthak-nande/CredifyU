// server.js
import express from 'express'
import cors from 'cors'
import { v4 as uuidv4 } from 'uuid'

const app = express()
const PORT = 4000

app.use(cors())
app.use(express.json())

app.listen(PORT, () => {
  console.log(`✅ Mock Verifier backend running at: http://localhost:${PORT}`)
})
