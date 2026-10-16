/**
 * Escape LIKE/ILIKE wildcard characters (`%`, `_`) and the escape char itself so that
 * user input passed to `.ilike()` is matched literally (case-insensitive exact match).
 * PostgreSQL's default LIKE escape character is backslash.
 */
export function escapeLikePattern(value: string): string {
    return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}
