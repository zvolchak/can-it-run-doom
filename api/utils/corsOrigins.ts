const DEFAULT_ORIGIN = "http://localhost:3000"

/**
 * Parses the comma-separated CORS_ORIGIN setting. Browsers send origins without a trailing
 * slash, and secrets managers sometimes keep literal quotes around a value, either of which
 * would make an exact-match origin silently fail (and browsers report that as a CORS error).
 */
export function parseCorsOrigins(raw: string | undefined): string[] {
    const origins = (raw || "")
        .split(",")
        .map(origin => origin.replace(/^[\s\\"'`]+|[\s\\"'`]+$/g, "").replace(/\/+$/, ""))
        .filter(Boolean)
    return origins.length > 0 ? origins : [DEFAULT_ORIGIN]
} // parseCorsOrigins
