interface IItemConentRow {
    title: string
    value?: any
    children?: any
}


export const ItemContentRow = ({ title, value, children, }: IItemConentRow) => {
    const titleClassSpan = title ? "col-span-7" : "col-span-12"
    const childrenParentClass = children ? "" : ""

    return (
        <div className="
                grid grid-cols gap-2 tracking-wider
                sm:grid-cols-12
            "
        >
            {/* Title Column */}
            {title && (
                <div className="
                    hidden sm:block
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
                    py-1 pl-3 bg-gray-700 justify-content-end text-left 
                    ${titleClassSpan}`
                }
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
