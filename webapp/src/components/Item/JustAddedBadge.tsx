export function JustAddedBadge({ overlay = false }: { overlay?: boolean }) {
    return <span className={`just-added-badge${overlay ? " just-added-badge--overlay" : ""}`}>Just added</span>
}
