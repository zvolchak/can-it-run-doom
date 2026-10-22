import type { ProjectAuthor } from "./projectPresentation"

/** Callers normalize authors with projectAuthors, including URL validation. */
export function ProjectAuthorLink({ author }: { author: ProjectAuthor }) {
    return author.url ? (
        <a className="project-author-link" href={author.url} target="_blank" rel="noopener noreferrer"
            aria-label={`${author.name} (opens in a new tab)`}>
            {author.name}
        </a>
    ) : <>{author.name}</>
}
