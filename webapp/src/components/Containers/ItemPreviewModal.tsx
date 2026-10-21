import { useId } from "react"
import { FiArrowUpRight } from "react-icons/fi"
import type { IArchiveItem } from "@/src/types"
import { ProjectDetails } from "../Item/ProjectDetails"
import { ProjectDialog } from "./ProjectDialog"
interface ItemPreviewModalProps {
    item: IArchiveItem | null
    onClose: () => void
    className?: string
}
export function ItemPreviewModal({
    item,
    onClose,
    className = "",
}: ItemPreviewModalProps) {
    const headingId = useId()
    return (
        <ProjectDialog headingId={headingId} onClose={onClose} className={className}
            footer={item?.id ? (
                <>
                    <span>Archive entry #{item.id}</span>
                    <a href={`/?id=${encodeURIComponent(item.id)}`}>
                        Open project page <FiArrowUpRight aria-hidden="true" />
                    </a>
                </>
            ) : null}>
            {item ? <ProjectDetails key={item.id} item={item} headingId={headingId} /> : (
                <section className="project-not-found">
                    <h2 id={headingId}>Project not found</h2>
                    <p>This project is not available in the archive. Close this dialog to continue browsing.</p>
                </section>
            )}
        </ProjectDialog>
    )
}
