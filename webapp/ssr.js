import * as functions from "firebase-functions"
import { createServer } from "http"
import { join, dirname } from "path"
import { parse, fileURLToPath } from "url"
import next from "next"


async function startServer(app) {
    const handle = app.getRequestHandler()
    const server = createServer((req, res) => {
        handle(req, res)
    })

    const PORT = process.env.PORT || 3000
    server.listen(PORT, () => {
        console.log(`> Ready on http://localhost:${PORT}`)
    })
} // startServer


async function serveCompiledApp(app, request, response) {
    const __dirname = dirname(fileURLToPath(import.meta.url)) // Define __dirname for ES modules
    const parsedUrl = parse(request.url, true)
    const staticPath = join(__dirname, ".next")

    // Serve static files in standalone mode (important for _next/static files)
    if (parsedUrl.pathname.startsWith("/_next/static")) {
        return response.sendFile(join(staticPath, parsedUrl.pathname))
    }
    const handle = app.getRequestHandler()

    await app.prepare()
    return handle(request, response, parsedUrl)
} // serveCompiledApp


const dev = (process.env.NODE_ENV || "").toLowerCase() !== "production"
const appCfg = { dev, conf: {} }
if (!dev) {
    appCfg.conf = {
        distDir: ".next/standalone", 
        output: "standalone",
    }
}

const app = next(appCfg)
console.log(` --- Is Dev: ${dev}`)
if (dev) {
  app.prepare().then(() => startServer(app))
}


export const nextServer = functions.https.onRequest(
    async (request, response) => serveCompiledApp(app, request, response)
)
