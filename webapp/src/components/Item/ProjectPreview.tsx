import { useState } from "react"
import Image from "next/image"
import { externalProjectUrl, projectText } from "./projectPresentation"
import { JustAddedBadge } from "./JustAddedBadge"

interface ProjectPreviewProps {
    src?: string
    title: string
    justAdded?: boolean
}

export function ProjectPreview({ src, title, justAdded = false }: ProjectPreviewProps) {
    const [failedSource, setFailedSource] = useState<string | null>(null)
    const text = projectText(src)
    const source = text.startsWith("/") && !text.startsWith("//")
        ? text
        : externalProjectUrl(text)?.href

    if (!source || source === failedSource) {
        return (
            <div className="project-preview project-preview--empty" role="img"
                aria-label={`${title}: preview unavailable${justAdded ? ", just added" : ""}`}>
                <span>No preview available</span>
                {justAdded && <JustAddedBadge />}
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
            {justAdded && <JustAddedBadge overlay />}
        </div>
    )
}
