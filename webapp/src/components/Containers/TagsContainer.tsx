import {
    BtnClearFilters,
} from "@/src/components"

interface ITagsContainerProps {
    title: string
    className?: string
    activeTags?: string[]
    onClearClick?: (e: any) => void
    children?: any
}


export function TagsContainer({
    title,
    className = "",
    activeTags = [],
    onClearClick = null,
    children,
}: ITagsContainerProps) {
    return (
        <div className={`
                flex flex-col
                gap-2 bg-gray-600 w-full pb-3
                ${className}
            `}
        >
            <div className="sticky top-0 bg-gray-600 pt-4 px-2 pb-0">
                <div className="flex space-x-2 justify-between pl-2">
                    <div className="doom-color-slate font-semibold">
                        {title}
                    </div>
                    
                    {activeTags.length > 0 &&
                        <div className="h-2 px-4">
                            <BtnClearFilters 
                                onClick={onClearClick}
                                className="doom-color-secondary doom-text-shadow-danger"
                            >
                                Clear
                            </BtnClearFilters>
                        </div>
                    }
                </div>
                <hr className="border-1 mt-2"/>
            </div>
            {children}
        </div>
    )
}
