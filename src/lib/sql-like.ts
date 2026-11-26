/**
 * Escape LIKE/ILIKE wildcard characters (`%`, `_`) and the escape char itself so that
 * user input passed to `.ilike()` is matched literally (case-insensitive exact match).
 * PostgreSQL's default LIKE escape character is backslash.
 */
export function escapeLikePattern(value: string): string {
    return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

/**
 * Escape a string for safe embedding inside a double-quoted PostgREST `.or()` filter value
 * (e.g. `col.ilike."%...%"`), stripping control characters and double quotes and doubling
 * backslashes so LIKE escape sequences survive PostgREST string parsing.
 */
export function escapePostgrestQuotedValue(value: string): string {
    return value.replace(/[\u0000-\u001f"]/g, '').replace(/\\/g, '\\\\');
}
