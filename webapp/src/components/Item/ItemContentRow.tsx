interface IItemConentRow {
    title?: string
    value?: any
    children?: any
    className?: string
}


export const ItemContentRow = ({ 
    title = null, 
    value, 
    children,
    className="",
}: IItemConentRow) => {
    const titleClassSpan = title ? "col-span-7" : "col-span-12"
    const childrenParentClass = children ? "" : ""

    return (
        <div className={`
                sm:grid sm:grid-cols 
                sm:grid-cols-12
                gap-2 tracking-wider
                flex
                flex-row
                ${className}
            `}
        >
            {/* Title Column */}
            {title && (
                <div className="
                    sm:block sm:w-auto
                    sm:w-full
                    col-span-5 justify-self-end py-1 text-right
                    items-center justify-center flex flex-col
                    "
                >
                    <p className="doom-gradient-light doom-text-shadow-light">
                        {title}
                    </p>
                </div>
            )}
            {/* Value Column */}
            <div
                className={`${childrenParentClass}
                    flex flex-row flex-wrap justify-end
                    py-1 px-3
                    bg-gray-700 
                    overflow-hidden
                    ${titleClassSpan}
                `}
            >
                {children ? (
                    children
                ) : (
                    <p className="tracking-widest">{value}</p>
                )}
            </div>
        </div>
    )
}
