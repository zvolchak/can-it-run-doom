import Head from 'next/head'
import { useEffect } from "react"
import { useDispatch, } from "react-redux"
import type { GetServerSideProps } from 'next'
import { IArchiveItem } from "@/src/types"
import {
    setItems,
    setAvailableTags,
    setAvailableYears,
    setAvailableAuthors,
} from "@/src/store"
import {
    ArchiveDataView,
} from "@/src/components"
import {
    fetchDoomPorts,
} from "@/src/api"
import {
    onSearch,
    filterById,
    filterItemsByTags,
    filterItemsByAuthors,
    getTagsFromItems,
    getAuthorsFromItems,
    getValueFromQuery,
    getYearsFromItems,
} from "@/src/utils"


interface IMainPageProps {
    items: IArchiveItem[]
    tags: string[]
    years: number[]
    authors: string[]
}


export default function MainPage({ items, tags, years, authors }: IMainPageProps) {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setItems(items))

        dispatch(setAvailableTags(tags)) 
        dispatch(setAvailableYears(years)) 
        dispatch(setAvailableAuthors(authors))
    }, [dispatch, items, tags, years, authors])


    return (
        <>
            <Head>
                <title>Can It Run Doom? An Archive of All Known Ports</title>
                {items.length === 1 && (
                    <>
                        <meta property="og:title" content={items[0].title} />
                        <meta property="og:image" content={items[0].previewImgUrl} />

                        <meta name="twitter:title" content={items[0].title} />
                        <meta name="twitter:image" content={items[0].previewImgUrl} />
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
    const yearNow = new Date().getFullYear()

    const searchQuery = decodeURIComponent(context.query?.search as string || "")
    const queryTags = getValueFromQuery(context.query, "tag")
    const idQuery = getValueFromQuery(context.query, "id")
    const authorQuery = getValueFromQuery(context.query, "author")
    const yearQuery = {
        lowest: getValueFromQuery(context.query, "yearlowest")[0] || 1996, 
        highest: getValueFromQuery(context.query, "yearhighest")[0] || yearNow,
    }

    let items: IArchiveItem[] = await fetchDoomPorts({})

    const tags = getTagsFromItems(items)
    const authors = getAuthorsFromItems(items).sort()

    if (searchQuery && searchQuery !== "")
        items = onSearch(items, searchQuery)
    if (authorQuery && authorQuery.length > 0)
        items = filterItemsByAuthors(items, authorQuery)
    if (idQuery && idQuery.length > 0)
        items = filterById(items, idQuery)
    if (queryTags && queryTags.length > 0)
        items = filterItemsByTags(items, queryTags)

    if (yearQuery.lowest || yearQuery.highest) {
        items = items?.filter((item: IArchiveItem) => {
            const itemYear = new Date(item.publishDate).getFullYear()
            return itemYear >= Number(yearQuery.lowest) && itemYear <= Number(yearQuery.highest)
        }) || []
    }

    // FIXME: move sorting to api endpoint
    items.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    const submissionYears = getYearsFromItems(items)

    return {
      props: {
        items,
        tags,
        years: submissionYears.sort(),
        authors,
      },
    }
} // getServerSideProps
