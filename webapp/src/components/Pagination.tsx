import { FiChevronLeft, FiChevronRight } from "react-icons/fi"
import { paginationPages } from "@/src/utils/archiveResults"

interface PaginationProps {
    numberOfPages: number
    currentPage: number
    onPageChange: (page: number) => void
    className?: string
}

export function Pagination({ numberOfPages, currentPage, onPageChange, className = "" }: PaginationProps) {
    if (numberOfPages <= 1) return null
    return (
        <nav className={`archive-pagination ${className}`} aria-label="Archive pagination">
            <button type="button" aria-label="Previous page" disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}>
                <FiChevronLeft aria-hidden="true" /><span className="archive-pagination__direction">Previous</span>
            </button>
            {paginationPages(currentPage, numberOfPages).map((page, index) => page === "ellipsis" ? (
                <span key={`ellipsis-${index}`} className="archive-pagination__ellipsis" aria-hidden="true">…</span>
            ) : (
                <button type="button" key={page} aria-label={`Page ${page}`}
                    aria-current={page === currentPage ? "page" : undefined}
                    disabled={page === currentPage} onClick={() => onPageChange(page)}>{page}</button>
            ))}
            <button type="button" aria-label="Next page" disabled={currentPage >= numberOfPages}
                onClick={() => onPageChange(currentPage + 1)}>
                <span className="archive-pagination__direction">Next</span><FiChevronRight aria-hidden="true" />
            </button>
        </nav>
    )
}
