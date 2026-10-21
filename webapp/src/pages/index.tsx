import type { GetServerSideProps } from "next"
import type { IArchiveItem } from "@/src/types"
import { fetchDoomPorts } from "@/src/api"

export { ArchivePage as default } from "@/src/components/Views/ArchivePage"

export const getServerSideProps: GetServerSideProps = async context => {
    context.res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=30")
    const items = await fetchDoomPorts() || []
    const storageBaseUrl = process.env.NEXT_PUBLIC_STORAGE_BASE_URL?.replace(/\/$/, "")
    const normalized = items.map((item: IArchiveItem) => ({
        ...item,
        previewImg: item.previewImg && !item.previewImg.startsWith("http") && storageBaseUrl
            ? `${storageBaseUrl}/${item.previewImg.replace(/^\//, "")}` : item.previewImg || null,
    }))
    return { props: { items: normalized, totalSize: normalized.length } }
}
