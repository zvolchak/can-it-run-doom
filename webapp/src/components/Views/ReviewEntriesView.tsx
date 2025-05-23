import { getMainLayout } from "@/src/layouts"
import { 
    IArchiveItem,
} from "@/src/types"
import {
    ItemCard,
    LoadingIcon,
    Modal,
} from "@/src/components"
import { reviewEntry } from "@/src/api"
import { useRouter } from "next/router"
import { useState } from "react"


interface IMainPageProps {
    items: IArchiveItem[]
}


export function ReviewEntriesView({ items }: IMainPageProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [idsToUpdate, setIdsToUpdate] = useState<string[]>([])
    const [statusToApply, setStatusToApply] = useState<string | null>(null)
    const [isConfirmModal, setIsConfirmModal] = useState<boolean>(false)
    const allIds = items.map(item => item.id)

    function onConfirmBtnClicked(ids: string[], status: string) {
        if (!status)
            return

        setIsLoading(true)
        reviewEntry({ ids, status }).finally(() => {
            setIsLoading(false)
            setIsConfirmModal(false)
            router.reload()
        })
    }


    function onDecisionSelected(ids: string[], status: string) {
        setIdsToUpdate(ids)
        setStatusToApply(status)
        setIsConfirmModal(true)
    }


    function ActionDropdown({ emptyOption = "",  onChange = null }) {
        return (
            <div>
                <select 
                    className="doom-select" 
                    id="status" 
                    name="status"
                    onChange={onChange}
                >
                    { !isLoading &&
                        <>
                            <option value="">{emptyOption}</option>
                            <option value="approved">Approve</option>
                            <option value="rejected">Reject</option>
                        </>
                    }
                    
                    {
                        isLoading &&
                        <LoadingIcon />
                    }
                </select>
            </div>
        )
    }


    return (
        <div className="">
            <div className="
                min-h-screen
                grid content-start justify-center gap-14 mt-5
                sm:gap-6"
            >
                <Modal 
                    open={isConfirmModal}
                    title={`You are about to apply "${statusToApply}" status to the following ID list`}
                    onClose={() => setIsConfirmModal(false)}
                >
                    <div className="flex flex-col justify-between items-center">
                        <div className="text-xl  overflow-auto max-h-80">
                            {idsToUpdate.join(", ")} id{items.length > 1 ? "s" : ""}.
                            <br />
                        </div>

                        <div className="w-full flex justify-between mt-10">
                            <button 
                                className="doom-btn-secondary w-24"
                                onClick={() => onConfirmBtnClicked(idsToUpdate, statusToApply)}
                            >
                                Confirm
                            </button>

                            <button 
                                className="doom-action-btn w-24"
                                onClick={() => setIsConfirmModal(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </Modal>

                <div className="flex flex-row text-white items-center gap-5">
                    <ActionDropdown 
                        emptyOption="Apply To All"
                        onChange={(e) => onDecisionSelected(allIds, e.target.value)}
                    />
                </div>

                <hr className="my-4" />
                
                {
                    items.map((item: IArchiveItem) =>
                        <div 
                            key={`doom port item for ${item.title}`}
                            className="flex flex-col"
                        >
                            <ActionDropdown
                                emptyOption="Review"
                                onChange={(e) => onDecisionSelected([item.id], e.target.value)}
                            />
                            <ItemCard 
                                item={item} 
                                className="justify-self-center px-4 w-full"
                            />
                        </div>
                    )
                }
            </div>
        </div>
    )
} // MainPage


ReviewEntriesView.getLayout = getMainLayout
