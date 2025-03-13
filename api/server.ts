import app from "."

const PORT = process.env.CANITRUNDOOM_API_PORT || 8080

app.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`)
})
