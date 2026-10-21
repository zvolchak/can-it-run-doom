import type { MouseEventHandler } from "react"
import type { IArchiveItem } from "@/src/types"
import { ProjectPreview } from "./ProjectPreview"
import { projectAuthors, projectDate, projectTags, projectText } from "./projectPresentation"

interface ProjectSummaryProps {
    item: IArchiveItem
    projectHref: string
    onProjectClick?: MouseEventHandler<HTMLAnchorElement>
    className?: string
}

/** Routing and any interception of the normal link belong to the caller. */
export function ProjectSummary({
    item, projectHref, onProjectClick, className = "",
}: ProjectSummaryProps) {
    const title = projectText(item.title) || "Untitled project"
    const description = projectText(item.description)
    const authors = projectAuthors(item.authors)
    const date = projectDate(item.publishDate)
    const tags = projectTags(item.tags)

    return (
        <article className={`project-summary ${className}`}>
            <div className="project-summary__layout">
                <ProjectPreview src={item.previewImg} title={title} />
                <div className="project-summary__body">
                    <h2 className="project-summary__title">{title}</h2>
                    {(authors.length > 0 || date) && (
                        <div className="project-summary__metadata">
                            {authors.length > 0 && (
                                <span>
                                    {authors.slice(0, 2).map(author => author.name).join(", ")}
                                    {authors.length > 2 && <span> +{authors.length - 2} more</span>}
                                </span>
                            )}
                            {date && <time dateTime={date.dateTime}>{date.year}</time>}
                        </div>
                    )}
                    {description && <p className="project-summary__description">{description}</p>}
                    <div className="project-summary__footer">
                        {tags.length > 0 && (
                            <ul className="project-tags" aria-label="Project tags">
                                {tags.slice(0, 2).map(tag => <li key={tag}>#{tag}</li>)}
                                {tags.length > 2 && <li>+{tags.length - 2} more</li>}
                            </ul>
                        )}
                        <a className="project-summary__action" href={projectHref}
                            onClick={onProjectClick} aria-label={`View project: ${title}`}>
                            View project <span aria-hidden="true">→</span>
                        </a>
                    </div>
                </div>
            </div>
        </article>
    )
}
