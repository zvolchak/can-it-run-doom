import Head from 'next/head'
import { useEffect } from "react"
import { useDispatch, } from "react-redux"
import { useRouter } from 'next/router'
import type { GetServerSideProps } from 'next'
import { 
    IArchiveItem,
} from "@/src/types"
import {
    selectItem,
    setItems,
} from "@/src/store"
import {
    CategorizedDataView,
} from "@/src/components"
import {
    fetchDoomPorts,
} from "@/src/api"


interface IMainPageProps {
    items: IArchiveItem[]
}


export default function MainPage({
    items,
}: IMainPageProps) {
    const router = useRouter()
    const dispatch = useDispatch()
    const selectedIds = (router.query?.id?.toString().split(",") || []) as string[]

    useEffect(() => {
        dispatch(setItems(items))
        dispatch(selectItem(null))
    }, [dispatch, items])

    
    function selectedItem(ids: string): IArchiveItem {
        return items?.filter(i => ids?.indexOf(i.id.toString()) >= 0)?.[0] || null
    } // selectedItems


    function getTitle() {
        const maxLength = 50
        let title = (selectedIds.length === 0) 
            ? "Can It Run Doom? An Archive of All Known Ports." 
            :(selectedItem(selectedIds[0])?.title || "")
    
        title = title.length > maxLength ? `${title.slice(0, maxLength)}...` : title
        return title
    } // getTitle


    function getDescription() {
        const maxLength = 150
        let dsc = selectedItem(selectedIds[0])?.description || ""
        dsc = dsc.length > maxLength ? `${dsc.slice(0, maxLength)}...` : dsc
        return dsc
    } // getDescription


    return (
        <>
            <Head>
                <title>{getTitle()}</title>

                {selectedIds?.length >= 1 && (
                    <>
                        <meta property="og:title" content={getTitle()} />
                        <meta property="og:image" content={selectedItem(selectedIds?.[0]).previewImg} />
                    </>
                )}
                {selectedIds?.length >= 1 && items[0].description?.length > 0 && (
                    <>
                        <meta name="description" content={getDescription()} />
                        <meta property="og:description" content={getDescription()} />

                        <meta name="twitter:description" content={getDescription()} />
                    </>
                )}
                
            </Head>

            <CategorizedDataView items={items} />
        </>
    )
} // MainPage


export const getServerSideProps: GetServerSideProps = async (context) => {
    const cacheTime = 60 * 5 // 5 minutes cache
    context.res.setHeader(
        "Cache-Control", 
        `public, s-maxage=${cacheTime}, stale-while-revalidate=30`
    )

    const items = await fetchDoomPorts()
    // Add base url to the preview image if it doesn't start with "http" - which means it
    // is a path to a storage backet.
    items.map((item: IArchiveItem) => {
        if (!item?.previewImg || item.previewImg?.startsWith("http"))
            return item

        const storageBaseUrl = process.env.NEXT_PUBLIC_STORAGE_BASE_URL?.replace(/\/$/, "")
        item.previewImg = `${storageBaseUrl}/${item.previewImg.replace(/^\//, "")}`
        return item
    })

    return {
        props: {
            items: items || [],
        },
    }
} // getServerSideProps
