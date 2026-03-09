/**
 * Global audience level store with localStorage persistence.
 *
 * Levels:
 *   child      → age 7-11
 *   teenager   → age 12-17
 *   adult      → general adult
 *   researcher → academic / researcher
 */

export type AudienceLevel = 'child' | 'teenager' | 'adult' | 'researcher';

export const AUDIENCE_LEVELS: AudienceLevel[] = ['child', 'teenager', 'adult', 'researcher'];

const STORAGE_KEY = 'uk-parliament-learn:audience-level';
const DEFAULT_LEVEL: AudienceLevel = 'adult';

type LevelListener = (level: AudienceLevel) => void;

let currentLevel: AudienceLevel = DEFAULT_LEVEL;
const listeners = new Set<LevelListener>();

/**
 * Load persisted level from localStorage, or fall back to the default.
 */
function loadPersistedLevel(): AudienceLevel {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && (AUDIENCE_LEVELS as string[]).includes(stored)) {
            return stored as AudienceLevel;
        }
    } catch {
        // localStorage unavailable (e.g., private browsing with strict settings)
    }
    return DEFAULT_LEVEL;
}

/**
 * Persist the given level to localStorage.
 */
function persistLevel(level: AudienceLevel): void {
    try {
        localStorage.setItem(STORAGE_KEY, level);
    } catch {
        // Ignore write failures
    }
}

/**
 * Initialise the store. Must be called once at app startup.
 * Safe to call multiple times — subsequent calls are no-ops.
 */
let initialised = false;
export function initLevelStore(): void {
    if (initialised) return;
    initialised = true;
    currentLevel = loadPersistedLevel();
}

/**
 * Get the current audience level.
 */
export function getLevel(): AudienceLevel {
    return currentLevel;
}

/**
 * Set the audience level, persist it, and notify all subscribers.
 */
export function setLevel(level: AudienceLevel): void {
    if (!AUDIENCE_LEVELS.includes(level)) {
        throw new Error(`Invalid audience level: ${level}`);
    }
    currentLevel = level;
    persistLevel(level);
    listeners.forEach(fn => fn(level));
}

/**
 * Subscribe to level changes. Returns an unsubscribe function.
 */
export function onLevelChange(listener: LevelListener): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

/**
 * Reset to default level (useful for testing).
 */
export function resetLevelStore(): void {
    initialised = false;
    currentLevel = DEFAULT_LEVEL;
    listeners.clear();
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        // Ignore
    }
}
