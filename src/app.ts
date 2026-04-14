import express from 'express'
import cors from 'cors'
import { xss } from 'express-xss-sanitizer'

const app: express.Application = express();


//Middleware
app.use(cors({origin: process.env.CLIENT_URL, credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json({limit: '10kb'}))
app.use(xss())

//ROUTES

export default app;