"use client"
import React, { useState } from 'react'
import { useRouter } from "next/router"
import { useSelector, } from "react-redux"
import {
    IArchiveItem,
} from "@/src/types"
import { RootState } from "@/src/store"
import {
    BtnClearFilters,
    Sidebar,
    Tag,
} from "@/src/components"
import {
    getTagsFromItems,
} from "@/src/utils"


export const SubNavbar = () => {
    const router = useRouter()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const tags: string[] = useSelector((state: RootState) => state.submissions.allTags)
    const items: IArchiveItem[] = useSelector((state: RootState) => state.submissions.items)
    const queryTags = (decodeURIComponent(router.query?.tag as string || "")).split(",")
            .filter(q => q || q !== "")

    const activeTags = items.length !== items.length ? getTagsFromItems(items) : []

    return (
        <nav className="bg-gray-700 p-2 h-10">
            <div className="flex justify-between items-center">
                <Sidebar
                    active={isSidebarOpen}
                    onToggle={(state: boolean) => setIsSidebarOpen(state)}
                >
                    <div className="flex flex-wrap flex-row gap-2 mt-3 p-4 max-h-64 border-2">
                        {
                            tags.map((tag: string) =>
                                <Tag 
                                    key={`tag_${tag}`} 
                                    text={tag} 
                                    className={`
                                        ${queryTags.indexOf(tag) >= 0 ? "active" : ""}
                                        ${queryTags.indexOf(tag) < 0 && activeTags.indexOf(tag) >= 0 ? "highlight" : ""}
                                    `}
                                />
                            )
                        }
                    </div>
                </Sidebar>

                <div className="flex space-x-2">
                    {Object.keys(router.query).length > 0 &&
                        <div className="h-2 px-4">
                            <BtnClearFilters />
                        </div>
                    }
                </div>
            </div>
        </nav>
    )
}
