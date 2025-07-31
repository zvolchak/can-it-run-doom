import app from "."

const secrets = process.env

const PORT = secrets.CANITRUNDOOM_API_PORT || 8080

app.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`)
})
