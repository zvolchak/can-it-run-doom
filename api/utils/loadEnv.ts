import dotenv from "dotenv"

// Load configuration before route imports initialize Firebase and other services.
dotenv.config({ path: process.env.DOTENV_PATH || ".env" })
