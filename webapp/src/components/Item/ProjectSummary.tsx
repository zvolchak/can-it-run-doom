import { Fragment, type MouseEventHandler } from "react"
import type { IArchiveItem } from "@/src/types"
import { topProjectTags } from "@/src/utils/archiveTags"
import { ProjectPreview } from "./ProjectPreview"
import { ProjectAuthorLink } from "./ProjectAuthorLink"
import { projectAuthors, projectDate, projectText } from "./projectPresentation"

import { archiveAdditionDate, isJustAdded } from "@/src/utils/additionDates"

interface ProjectSummaryProps {
    now?: number
    item: IArchiveItem
    projectHref: string
    onProjectClick?: MouseEventHandler<HTMLAnchorElement>
    className?: string
    onTagClick?: (tag: string) => void
    selectedTags?: string[]
    tagUsage: ReadonlyMap<string, number>
}

/** Routing and any interception of the normal link belong to the caller. */
export function ProjectSummary({
    item, now, projectHref, onProjectClick, className = "", onTagClick, selectedTags = [], tagUsage,
}: ProjectSummaryProps) {
    const title = projectText(item.title) || "Untitled project"
    const description = projectText(item.description)
    const authors = projectAuthors(item.authors)
    const date = projectDate(item.publishDate)
    const tags = topProjectTags(item.tags, tagUsage)

    return (
        <article className={`project-summary ${className}`}>
            <div className="project-summary__layout">
                <ProjectPreview src={item.previewImg} title={title}
                    justAdded={now !== undefined && isJustAdded(archiveAdditionDate(item), now)} />
                <div className="project-summary__body">
                    <h2 className="project-summary__title">{title}</h2>
                    {(authors.length > 0 || date) && (
                        <div className="project-summary__metadata">
                            {date && <time dateTime={date.dateTime}>{date.label}</time>}
                            {authors.length > 0 && (
                                <span>
                                    By{" "}{authors.slice(0, 2).map((author, index) => (
                                        <Fragment key={author.key}>
                                            {index > 0 && ", "}<ProjectAuthorLink author={author} />
                                        </Fragment>
                                    ))}
                                    {authors.length > 2 && <span> +{authors.length - 2} more</span>}
                                </span>
                            )}
                        </div>
                    )}
                    {description && <p className="project-summary__description">{description}</p>}
                    <div className="project-summary__footer">
                        {tags.length > 0 && (
                            <ul className="project-tags" aria-label="Project tags">
                                {tags.map(tag => {
                                    return <li key={tag}>{onTagClick ? (
                                        <button type="button" className="project-tags__filter"
                                            aria-label={`Filter by tag: ${projectText(tag)}`} aria-pressed={selectedTags.includes(tag)}
                                            onClick={() => onTagClick(tag)}>#{projectText(tag)}</button>
                                    ) : <>#{projectText(tag)}</>}</li>
                                })}
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
