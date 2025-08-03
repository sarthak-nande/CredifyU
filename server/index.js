import express from 'express'
import cors from 'cors'
import env from "dotenv"
import cookieParser from 'cookie-parser';
import connection from "./db/connection.js"
import UserRoutes from "./routes/UserRoutes.js"
import StudentRoutes from "./routes/StudentRoutes.js"
import KeysRoutes from "./routes/KeysRoutes.js";

env.config();
connection();

const app = express()
const PORT = 5000

app.use(express.json())
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL, // React app
  credentials: true
}));

app.use('/api', UserRoutes);
app.use('/api', StudentRoutes);
app.use('/api', KeysRoutes);

app.get("/" , async(req, res) => {
  res.status(200).json({"message" : "server is running"});
})

app.listen(PORT, () => {
  console.log(`✅ Mock Verifier backend running at: http://localhost:${PORT}`)
})
