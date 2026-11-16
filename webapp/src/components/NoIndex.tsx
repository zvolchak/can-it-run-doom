import Head from "next/head"

/** Keeps account, auth, and moderation pages out of search results. */
export function NoIndex() {
    return (
        <Head>
            <meta name="robots" content="noindex, nofollow" />
        </Head>
    )
}
