import express from 'express'
import cors from 'cors'
import env from "dotenv"
import { v4 as uuidv4 } from 'uuid'
import connection from "./db/connection.js"

env.config();
connection();

const app = express()
const PORT = 4000

app.use(cors())
app.use(express.json())

app.listen(PORT, () => {
  console.log(`✅ Mock Verifier backend running at: http://localhost:${PORT}`)
})
