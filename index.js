import 'dotenv/config'
import express from 'express'
import apiRouter from './routes/index.js'
import { connectDB } from './config/dbConfig.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
const app = express()
const port = 4500

// acces req.body
app.use(express.json())
// cors 
app.use(cors(
  {
    origin: [
      'https://spicezy-food-order.vercel.app',
      'http://localhost:5173',
      'https://66d5fb33d946f9000881bc64--spicezy-food-delivery.netlify.app'
    ],
    credentials:true
  }
))
// to get req.cookies
app.use(cookieParser())
// mongodb connection
connectDB();

app.use('/api', apiRouter)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})