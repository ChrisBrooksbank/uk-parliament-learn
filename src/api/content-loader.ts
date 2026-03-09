import type { Topic, Category, GlossaryTerm } from '../types/index';
import { Logger } from '@utils/logger';

// All topic YAML files, excluding infrastructure files (_*.yaml) — resolved by Vite at build time
const topicModules = import.meta.glob(['/content/**/*.yaml', '!/content/**/_*.yaml'], {
    eager: true,
    import: 'default',
}) as Record<string, Topic>;

// Categories data file
const categoriesRaw = import.meta.glob('/content/_categories.yaml', {
    eager: true,
    import: 'default',
}) as Record<string, { categories: Category[] }>;

// Glossary master file
const glossaryRaw = import.meta.glob('/content/_glossary-master.yaml', {
    eager: true,
    import: 'default',
}) as Record<string, { terms: GlossaryTerm[] }>;

let topicsCache: Topic[] | null = null;
let categoriesCache: Category[] | null = null;
let glossaryCache: Map<string, GlossaryTerm> | null = null;

/** Clear the in-memory cache. Useful for testing. */
export function clearCache(): void {
    topicsCache = null;
    categoriesCache = null;
    glossaryCache = null;
}

/**
 * Load all topic YAML files into memory.
 * Returns the cached result on subsequent calls.
 */
export function loadTopics(): Topic[] {
    if (topicsCache !== null) return topicsCache;

    const topics: Topic[] = [];
    for (const [path, data] of Object.entries(topicModules)) {
        try {
            topics.push(data);
        } catch (error) {
            Logger.error(`Failed to load topic from ${path}:`, String(error));
        }
    }

    topicsCache = topics;
    return topics;
}

/**
 * Load glossary terms from `_glossary-master.yaml` into a keyed lookup map.
 * Keys are lowercase term names for case-insensitive lookup.
 * Returns the cached result on subsequent calls.
 */
export function loadGlossary(): Map<string, GlossaryTerm> {
    if (glossaryCache !== null) return glossaryCache;

    const entries = Object.values(glossaryRaw);
    if (entries.length === 0) {
        throw new Error('_glossary-master.yaml not found');
    }

    const map = new Map<string, GlossaryTerm>();
    for (const term of entries[0]!.terms) {
        map.set(term.term.toLowerCase(), term);
    }

    glossaryCache = map;
    return glossaryCache;
}

/**
 * Load categories from `_categories.yaml` into memory.
 * Returns the cached result on subsequent calls.
 */
export function loadCategories(): Category[] {
    if (categoriesCache !== null) return categoriesCache;

    const entries = Object.values(categoriesRaw);
    if (entries.length === 0) {
        throw new Error('_categories.yaml not found');
    }

    categoriesCache = [...entries[0]!.categories];
    return categoriesCache;
}
