import Head from 'next/head'
import { useEffect } from "react"
import { useDispatch, } from "react-redux"
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
} from "@/src/utils"


interface IMainPageProps {
    items: IArchiveItem[]
    queryTags?: string[]
    years?: { lowest: number, highest: number }
    authorQuery?: string[]
    searchQuery?: string
    idQuery?: string[]
    page?: number
}


export default function MainPage({
    items,
    queryTags = [],
    years = null,
    authorQuery = [],
    searchQuery = "",
    idQuery = [],
    page = 0,
}: IMainPageProps) {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setItems(items))

        const tags = getTagsFromItems(items)
        const authors = getAuthorsFromItems(items).sort()

        dispatch(setAvailableTags(tags)) 
        dispatch(setAvailableYears(years)) 
        dispatch(setAvailableAuthors(authors))

        dispatch(setAppliedAuthors(authorQuery)) 
        dispatch(setAppliedTags(queryTags)) 
        dispatch(setAppliedYears(years))
        dispatch(setAppliedSearch(searchQuery))
        dispatch(setAppliedId(idQuery))
        dispatch(setAppliedPage(page))
    }, [dispatch, items, years, authorQuery, queryTags, searchQuery, idQuery, page])


    return (
        <>
            <Head>
                <title>Can It Run Doom? An Archive of All Known Ports</title>
                {items.length === 1 && (
                    <>
                        <meta property="og:title" content={items[0].title} />
                        <meta property="og:image" content={items[0].previewImg} />

                        <meta name="twitter:title" content={items[0].title} />
                        <meta name="twitter:image" content={items[0].previewImg} />
                    </>
                )}
                {items.length === 1 && items[0].description.length > 0 && (
                    <>
                        <meta name="description" content={`${items[0].description.slice(0, 150)}...`} />
                        <meta property="og:description" content={`${items[0].description.slice(0, 150)}...`} />

                        <meta name="twitter:description" content={items[0].description.slice(0, 150)} />
                    </>
                )}
                
            </Head>

            <ArchiveDataView items={items} />
        </>
    )
} // MainPage


export const getServerSideProps: GetServerSideProps = async (context) => {
    // 1 hour
    const cacheTime = 60 * 60
    context.res.setHeader(
        "Cache-Control", 
        `public, s-maxage=${cacheTime}, stale-while-revalidate=30`
    )

    const searchQuery = decodeURIComponent(context.query?.search as string || "")
    const queryTags = getValueFromQuery(context.query, "tag")
    const idQuery = getValueFromQuery(context.query, "id")
    const authorQuery = getValueFromQuery(context.query, "author")
    const yearQuery: IRange = {
        start: Number(getValueFromQuery(context.query, "yearlowest")[0]) || null, 
        end: Number(getValueFromQuery(context.query, "yearhighest")[0]) || null,
    }
    const page = Number(context.query?.page || 0)

    const items: IArchiveItem[] = await fetchDoomPorts({})

    return {
        props: {
            items,
            queryTags,
            years: yearQuery,
            authorQuery,
            searchQuery,
            idQuery,
            page,
        },
    }
} // getServerSideProps
