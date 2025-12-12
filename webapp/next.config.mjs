/** @type {import("next").NextConfig} */
const nextConfig = {
    output: "standalone",
    distDir: ".next",

    images: {
        remotePatterns: [
            { protocol: "https", hostname: "github.com" },
            { protocol: "https", hostname: "raw.githubusercontent.com" },
            { protocol: "http", hostname: "127.0.0.1" },
            { protocol: "http", hostname: "firebasestorage.googleapis.com" }
        ]
    }
}

export default nextConfig
