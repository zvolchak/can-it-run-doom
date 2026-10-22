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

    const usesPlaceholder = !source || source === failedSource
    const previewSource = usesPlaceholder ? "/doom-placeholder.jpeg" : source

    return (
        <div className="project-preview">
            <Image
                key={previewSource}
                src={previewSource}
                alt={usesPlaceholder ? `Doom placeholder for ${title}` : `Preview of ${title}`}
                width={1200}
                height={750}
                unoptimized
                onError={usesPlaceholder ? undefined : () => setFailedSource(source)}
            />
            {justAdded && <JustAddedBadge overlay />}
        </div>
    )
}
