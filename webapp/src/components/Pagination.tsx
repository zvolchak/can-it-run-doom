import { useRouter } from 'next/router'
import React from 'react'


interface IPaginationProps {
    numberOfPages: number
    currentPage: number
    className?: string
}


export function Pagination({ numberOfPages, currentPage, className = "" }: IPaginationProps) {
    const router = useRouter()

    function onChangePage(page: number | string) {
        if (typeof page !== 'number') return

        if (page <= 1) page = 1
        if (page >= numberOfPages) page = numberOfPages
        window?.scrollTo(0, 0)
        router.push({ query: { page } })
    }


    function getRange() {
        let maxRange = 2
        if (currentPage > 2) maxRange = 1
        if (currentPage >= numberOfPages - 1) maxRange = 2

        const range: Array<string | number> = []

        for (let i = -maxRange; i <= maxRange; i++) {
            const page = currentPage + i
            if (page <= 1) continue
            if (page >= numberOfPages) continue
            range.push(page)
        }

        if (currentPage - maxRange > 2) range.splice(0, 0, '...')
        if (currentPage + maxRange < numberOfPages - 1) range.splice(range.length, 0, '...')

        return [1, ...range, numberOfPages]
    }


    function getPageClass(page: string | number) {
        if (typeof page === 'string') return 'disabled'
        if (page === currentPage) return 'active'
        return ''
    }

    return (
        <div className={`flex justify-center gap-4 ${className}`}>
            {numberOfPages >= 2 && (
                <span
                    className="page-link"
                    onClick={() => onChangePage(currentPage - 1)}
                >
                    Previous
                </span>
            )}

            {numberOfPages > 1 &&
                getRange().map((page, index) => (
                    <span
                        key={typeof page === 'string' ? `${page}-${index}` : page}
                        className={`page-link ${getPageClass(page)}`}
                        onClick={() => onChangePage(page)}
                    >
                        {page}
                    </span>
                ))}

            {numberOfPages >= 2 && (
                <span
                    className="page-link"
                    onClick={() => onChangePage(currentPage + 1)}
                >
                    Next
                </span>
            )}
        </div>
    )
}
