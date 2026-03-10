/**
 * Audience level selector UI component.
 *
 * Renders buttons in the header for each audience level and keeps the
 * active state in sync with the global level store.
 */

import { AUDIENCE_LEVELS, getLevel, setLevel, onLevelChange } from './levelStore';
import type { AudienceLevel } from './levelStore';

const LEVEL_LABELS: Record<AudienceLevel, string> = {
    child: 'Child',
    teenager: 'Teen',
    adult: 'Adult',
    researcher: 'Researcher',
};

/**
 * Update button active states to reflect `activeLevel`.
 */
function syncButtons(container: Element, activeLevel: AudienceLevel): void {
    const buttons = container.querySelectorAll<HTMLButtonElement>('[data-level]');
    for (const btn of buttons) {
        const isActive = btn.dataset.level === activeLevel;
        btn.classList.toggle('level-btn--active', isActive);
        btn.setAttribute('aria-pressed', String(isActive));
    }
}

/**
 * Initialise the level selector.  Looks for `#level-selector` in the DOM,
 * populates it with one button per level, and wires up click handlers and
 * store subscriptions.
 *
 * Must be called after the DOM is ready and after `initLevelStore()`.
 */
export function initLevelSelector(): void {
    const container = document.getElementById('level-selector');
    if (!container) return;

    // Build buttons
    const html = AUDIENCE_LEVELS.map(level => {
        const label = LEVEL_LABELS[level];
        return `<button class="level-btn" data-level="${level}" aria-pressed="false">${label}</button>`;
    }).join('');
    container.innerHTML = html;

    // Sync initial state
    syncButtons(container, getLevel());

    // Handle clicks
    container.addEventListener('click', (event: Event) => {
        const target = event.target as HTMLElement;
        const btn = target.closest<HTMLButtonElement>('[data-level]');
        if (!btn) return;
        const level = btn.dataset.level as AudienceLevel;
        if (AUDIENCE_LEVELS.includes(level)) {
            setLevel(level);
        }
    });

    // Subscribe to external level changes
    onLevelChange(level => syncButtons(container, level));
}
