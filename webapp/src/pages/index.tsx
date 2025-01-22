import Head from 'next/head'
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import type { GetServerSideProps } from 'next'
import { IArchiveItem } from "@/src/types"
import {
    setItems,
} from "@/src/store"
import {
    ArchiveDataView,
} from "@/src/components"
import {
    fetchArchiveData,
} from "@/src/api"
import {
    onSearch,
    filterById,
    filterItemsByTags,
    getTagsFromItems,
} from "@/src/utils"


interface IMainPageProps {
    items: IArchiveItem[]
    tags: string[]
}


export default function MainPage({ items, tags }: IMainPageProps) {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setItems(items))
    }, [dispatch, items])


    return (
        <>
            <Head>
                <title>Can it run DOOM?</title>
                {items.length === 1 && (
                    <>
                        <meta property="og:title" content={items[0].title} />
                        <meta property="og:image" content={items[0].previewImgUrl} />
                    </>
                )}
                {items.length === 1 && items[0].description.length > 0 && (
                    <>
                        <meta name="description" content={`${items[0].description.slice(0, 150)}...`} />
                        <meta property="og:description" content={`${items[0].description.slice(0, 150)}...`} />
                    </>
                )}
                
            </Head>

            <ArchiveDataView items={items} tags={tags} />
        </>
    )
} // MainPage


export const getServerSideProps: GetServerSideProps = async (context) => {
    context.res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=30")

    const searchQuery = decodeURIComponent(context.query?.search as string || "")
    const queryTags = (decodeURIComponent(context.query?.tag as string || "")).split(",")
            .filter(q => q || q !== "")
    const idQuery = decodeURIComponent(context.query?.id as string || "").split(",")
            .filter(q => q || q !== "")

    let items: IArchiveItem[] = await fetchArchiveData({})
    const tags = getTagsFromItems(items)

    if (searchQuery && searchQuery !== "")
        items = onSearch(items, searchQuery)
    if (idQuery && idQuery.length > 0)
        items = filterById(items, idQuery)
    if (queryTags && queryTags.length > 0)
        items = filterItemsByTags(items, queryTags)

    // FIXME: move sorting to api endpoint
    items.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    return {
      props: {
        items,
        tags
      },
    }
} // getServerSideProps
