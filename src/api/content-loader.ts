import type { Topic, Category } from '../types/index';
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

let topicsCache: Topic[] | null = null;
let categoriesCache: Category[] | null = null;

/** Clear the in-memory cache. Useful for testing. */
export function clearCache(): void {
    topicsCache = null;
    categoriesCache = null;
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
