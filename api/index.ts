import dotenv from "dotenv"
dotenv.config({ path: process.env.DOTENV_PATH || ".env" })

import express from "express"
import cors from "cors"
import { https } from "firebase-functions"
import winston from "winston"
import { 
    DoomProtsRouter,
    AuthorsRouter,
    TagsRouter,
} from "./routes"

const isDev = process.env.NODE_ENV === "development" || true
const BASE_URL = isDev ? "/api/v1" : "/v1"

const app = express()

const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [new winston.transports.Console()],
})


app.use(express.json())
app.use((req, res, next) => {
    logger.info({
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
    })
    next()
})

const CORS_ORIGIN = (process.env.CORS_ORIGIN || "").split(",") || []
app.use(cors({
    origin: "*",              
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],   
    allowedHeaders: ["Content-Type", "Authorization"]
}))

app.options("*", (req, res) => {
    res.set({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
        "Access-Control-Max-Age": "86400", // Optional: Cache preflight response
    });
    res.sendStatus(204); // No Content
});

app.use(BASE_URL, DoomProtsRouter)
app.use(BASE_URL, AuthorsRouter)
app.use(BASE_URL, TagsRouter)

export const api = https.onRequest(app)
export default app
