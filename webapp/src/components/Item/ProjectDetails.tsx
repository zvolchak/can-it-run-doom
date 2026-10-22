import { useId } from "react"
import { FiArrowUpRight, FiCheckCircle, FiCode, FiExternalLink } from "react-icons/fi"
import type { IArchiveItem } from "@/src/types"
import { ProjectPreview } from "./ProjectPreview"
import {
    projectAuthors, projectDate, projectSources, projectTags, projectText,
    type ProjectSource,
} from "./projectPresentation"

interface ProjectDetailsProps {
    item: IArchiveItem
    headingId?: string
    className?: string
}

function ProjectSourceList({ title, sources, code = false }: {
    title: string
    sources: ProjectSource[]
    code?: boolean
}) {
    const headingId = useId()
    if (sources.length === 0) return null
    const Icon = code ? FiCode : FiExternalLink

    return (
        <section className="project-details__sources" aria-labelledby={headingId}>
            <h3 id={headingId}>{title} <span className="project-details__count">({sources.length})</span></h3>
            <ul>
                {sources.map(source => (
                    <li key={source.key}>
                        <a href={source.url} target="_blank" rel="noopener noreferrer">
                            <Icon aria-hidden="true" className="project-details__source-icon" />
                            <span className="project-details__source-copy">
                                <span className="project-details__source-name">{source.name}</span>
                                <span className="project-details__source-host">{source.hostname}</span>
                            </span>
                            <FiArrowUpRight aria-hidden="true" className="project-details__source-icon" />
                            <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                    </li>
                ))}
            </ul>
        </section>
    )
}

/** Shared by dialog and standalone project views; has no selection or routing state. */
export function ProjectDetails({ item, headingId, className = "" }: ProjectDetailsProps) {
    const generatedHeadingId = useId()
    const titleId = headingId || generatedHeadingId
    const title = projectText(item.title) || "Untitled project"
    const description = projectText(item.description)
    const date = projectDate(item.publishDate)
    const authors = projectAuthors(item.authors)
    const media = projectSources(item.sourcesUrl)
    const code = projectSources(item.sourceCodeUrl)
    const tags = projectTags(item.tags)

    return (
        <article className={`project-details ${className}`} aria-labelledby={titleId}>
            <header className="project-details__header">
                {date && <time className="project-details__date" dateTime={date.dateTime}>{date.label}</time>}
                <h2 id={titleId} className="project-details__title">{title}</h2>
                {authors.length > 0 && (
                    <div className="project-details__authors">
                        <span aria-hidden="true">By</span>
                        <ul aria-label="Authors">
                            {authors.map(author => (
                                <li key={author.key}>
                                    {author.url ? (
                                        <a href={author.url} target="_blank" rel="noopener noreferrer">
                                            {author.name}<span className="sr-only"> (opens in a new tab)</span>
                                        </a>
                                    ) : author.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </header>

            <ProjectPreview src={item.previewImg} title={title} />
            {description && <p className="project-details__description">{description}</p>}

            {(media.length > 0 || code.length > 0) && (
                <div className="project-details__source-groups">
                    <ProjectSourceList title="Media & references" sources={media} />
                    <ProjectSourceList title="Source code" sources={code} code />
                </div>
            )}

            {(tags.length > 0 || typeof item.isFirstLevelComplete === "boolean") && (
                <footer className="project-details__facts">
                    {tags.length > 0 && (
                        <ul className="project-tags" aria-label="Project tags">
                            {tags.map(tag => <li key={tag}>#{tag}</li>)}
                        </ul>
                    )}
                    {typeof item.isFirstLevelComplete === "boolean" && (
                        <p className={`project-details__completion ${item.isFirstLevelComplete ? "project-details__completion--complete" : ""}`}>
                            {item.isFirstLevelComplete && <FiCheckCircle aria-hidden="true" />}
                            {item.isFirstLevelComplete ? "First level completed" : "First level not marked complete"}
                        </p>
                    )}
                </footer>
            )}
        </article>
    )
}
