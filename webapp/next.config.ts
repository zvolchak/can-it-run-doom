import dotenv from "dotenv"
dotenv.config()

/** @type {import("next").NextConfig} */
const nextConfig = {
    output: "standalone",
    distDir: ".next",
    "assetPrefix": "",
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "github.com",
            },
            {
                protocol: "https",
                hostname: "raw.githubusercontent.com",
            }
        ],
    },
}

export default nextConfig
