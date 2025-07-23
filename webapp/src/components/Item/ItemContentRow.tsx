interface IItemConentRow {
    title: string
    value?: any
    children?: any
    className?: string
}


export const ItemContentRow = ({ 
    title, 
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
                flex-row flex
                ${className}
            `}
        >
            {/* Title Column */}
            {title && (
                <div className="
                    sm:block sm:w-auto
                    sm:w-full
                    w-1/2
                    col-span-5 justify-self-end py-1 text-right"
                >
                    <p className="doom-gradient-light doom-text-shadow-light">
                        {title}
                    </p>
                </div>
            )}
            {/* Value Column */}
            <div
                className={`${childrenParentClass}
                    flex justify-content-start items-center 
                    text-start
                    py-1 px-3
                    w-1/2
                    sm:w-full
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
