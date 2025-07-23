import { RxCaretRight } from "react-icons/rx"

interface IProps {
    title: string,
    label?: string,
    onClick?: () => void,
    className?: string,
}


export function PreviewTitleWithBtn({
    title,
    label = "More",
    onClick = null,
    className = ""
}: IProps) {
    return (
        <div className={`
            flex flex-row justify-between
            w-full 
            text-white 
            p-1 mb-1 pl-3
            ${className}
            `}
        >
            <p>
                {title}
            </p>
            {
                onClick !== null &&
                <p className="doom-btn flex flex-row items-center text-sm"
                    onClick={() => onClick?.()}
                >
                    {label}
                    <RxCaretRight />
                </p>
            }
        </div>
    ) // return
}
