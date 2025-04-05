import type { GetServerSideProps } from 'next'
import { 
    IArchiveItem,
} from "@/src/types"
import {
    ReviewEntriesView,
} from "@/src/components"
import { fetchDoomPorts } from '@/src/api'


interface IReviewEntriesPageProps {
    items: IArchiveItem[]
}


export default function ReviewEntriesPage({ items }: IReviewEntriesPageProps) {
    return (
        <div className="min-h-screen flex flex-col items-center">
            { items?.length > 0 &&
                <ReviewEntriesView items={items} />
            }
            { items?.length === 0 &&
                <div className="text-white text-3xl mt-40">
                    No items to review.
                </div>
            }
        </div>
    )
} // MainPage


export const getServerSideProps: GetServerSideProps = async () => {
    const items = await fetchDoomPorts({ status: "pending" })
    return {
        props: {
            items: items || [],
        },
    }
} // getServerSideProps
