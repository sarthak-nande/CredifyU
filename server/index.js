import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { v4 as uuidv4 } from 'uuid'
import connection from './db/connection.js'
import UserRoutes from './routes/UserRoutes.js'
import serverless from 'serverless-http'

dotenv.config()
connection()

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: 'http://localhost:5173', // change to your frontend URL on prod
    credentials: true,
  })
)

app.use('/api', UserRoutes)

app.get('/', (req, res) => {
  res.status(200).json({ message: 'server is running' })
})

export const handler = serverless(app)
export default handler
