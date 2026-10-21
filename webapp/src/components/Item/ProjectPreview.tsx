import { useState } from "react"
import Image from "next/image"
import { externalProjectUrl, projectText } from "./projectPresentation"

interface ProjectPreviewProps {
    src?: string
    title: string
}

export function ProjectPreview({ src, title }: ProjectPreviewProps) {
    const [failedSource, setFailedSource] = useState<string | null>(null)
    const text = projectText(src)
    const source = text.startsWith("/") && !text.startsWith("//")
        ? text
        : externalProjectUrl(text)?.href

    if (!source || source === failedSource) {
        return (
            <div className="project-preview project-preview--empty" role="img"
                aria-label={`${title}: preview unavailable`}>
                <span>No preview available</span>
            </div>
        )
    }

    return (
        <div className="project-preview">
            <Image
                key={source}
                src={source}
                alt={`Preview of ${title}`}
                width={1200}
                height={750}
                unoptimized
                onError={() => setFailedSource(source)}
            />
        </div>
    )
}
