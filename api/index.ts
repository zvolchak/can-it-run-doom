import dotenv from "dotenv"
dotenv.config({ path: process.env.DOTENV_PATH || ".env" })

import express from "express"
import { rateLimit } from 'express-rate-limit'
import { https } from "firebase-functions"
import cors from "cors"
import cookieParser from 'cookie-parser'
import winston from "winston"
import { 
    DoomProtsRouter,
    AuthorsRouter,
    TagsRouter,
    UserRouter,
} from "./routes"

const BASE_URL = "/api/v1"

const app = express()

const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [new winston.transports.Console()],
})

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    message: "Too many requests. Try again in 15 minutes."
})

// Trust first proxy (e.g., Firebase Functions, Cloud Run, Nginx)
app.set("trust proxy", 1)
app.use(limiter)
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use((req, res, next) => {
    logger.info({
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
    })
    next()
})

const CORS_ORIGIN = (process.env.CORS_ORIGIN || "http://localhost:3000").split(",") || []
app.use(cors({
    origin: CORS_ORIGIN,              
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],   
    allowedHeaders: ["Content-Type", "Authorization"]
}))
app.use(cookieParser())

app.options("*", (req, res) => {
    res.set({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
        "Access-Control-Max-Age": "86400", // Optional: Cache preflight response
    })
    res.sendStatus(204) // No Content
})

app.use(BASE_URL, DoomProtsRouter)
app.use(BASE_URL, AuthorsRouter)
app.use(BASE_URL, TagsRouter)
app.use(BASE_URL, UserRouter)

export const api = https.onRequest(app)
export default app
