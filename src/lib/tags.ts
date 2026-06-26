export function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  return tags
    .filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
    .map(t => t.toLowerCase().trim())
    .filter((v, i, a) => a.indexOf(v) === i);
}

export function matchesTags(docTags: string[], filterTags: string[]): boolean {
  if (!filterTags.length) return true;
  return filterTags.some(t => docTags.includes(t));
}
