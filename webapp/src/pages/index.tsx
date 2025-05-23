import Head from 'next/head'
import { useEffect } from "react"
import { useDispatch, } from "react-redux"
import { useRouter } from 'next/router'
import type { GetServerSideProps } from 'next'
import { 
    IArchiveItem,
    IRange,
} from "@/src/types"
import {
    setItems,
    setAvailableTags,
    setAvailableYears,
    setAvailableAuthors,
    
    setAppliedAuthors,
    setAppliedTags,
    setAppliedYears,
    setAppliedId,
    setAppliedSearch,
    setAppliedPage,
    setTotalSize,
} from "@/src/store"
import {
    ArchiveDataView,
} from "@/src/components"
import {
    fetchDoomPorts,
} from "@/src/api"
import {
    getTagsFromItems,
    getAuthorsFromItems,
    getValueFromQuery,
    getYearsFromItems,
} from "@/src/utils"


interface IMainPageProps {
    items: IArchiveItem[]
    totalSize: number // total number of items that, aka current page + the rest
    queryTags?: string[]
    years?: { lowest: number, highest: number }
    authorQuery?: string[]
    searchQuery?: string
    idQuery?: string[]
    page?: number
}


export default function MainPage({
    items,
    totalSize,
    queryTags = [],
    years = null,
    authorQuery = [],
    searchQuery = "",
    idQuery = [],
    page = 0,
}: IMainPageProps) {
    const router = useRouter()
    const dispatch = useDispatch()
    const selectedIds = (router.query?.id?.toString().split(",") || []) as string[]

    useEffect(() => {
        dispatch(setItems(items))

        const tags = getTagsFromItems(items)
        const authors = getAuthorsFromItems(items).sort()

        const availableYears = getYearsFromItems(items)
        dispatch(setAvailableTags(tags)) 
        dispatch(setAvailableYears(availableYears)) 
        dispatch(setAvailableAuthors(authors))

        dispatch(setAppliedAuthors(authorQuery)) 
        dispatch(setAppliedTags(queryTags))
        dispatch(setAppliedYears(years))
        dispatch(setAppliedSearch(searchQuery))
        dispatch(setAppliedId(idQuery))
        dispatch(setAppliedPage(page))
        dispatch(setTotalSize(totalSize))
    }, [dispatch, items, years, authorQuery, queryTags, searchQuery, idQuery, page, totalSize])

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

            <ArchiveDataView items={items} />
        </>
    )
} // MainPage


export const getServerSideProps: GetServerSideProps = async (context) => {
    const cacheTime = 60 * 5 // 5 minutes cache
    context.res.setHeader(
        "Cache-Control", 
        `public, s-maxage=${cacheTime}, stale-while-revalidate=30`
    )
    const searchQuery = decodeURIComponent(context.query?.search as string || "")
    const queryTags = getValueFromQuery(context.query, "tag")
    const idQuery = getValueFromQuery(context.query, "id")
    const authorQuery = getValueFromQuery(context.query, "author")
    const yearQuery: IRange = {
        start: Number(getValueFromQuery(context.query, "yearstart")[0]) || null, 
        end: Number(getValueFromQuery(context.query, "yearend")[0]) || null,
    }
    const page = Number(context.query?.page || 1)

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
            totalSize: items?.length || 0,
            queryTags,
            years: yearQuery,
            authorQuery,
            searchQuery,
            idQuery,
            page,
        },
    }
} // getServerSideProps
