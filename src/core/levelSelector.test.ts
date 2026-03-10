import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initLevelSelector } from './levelSelector';
import { initLevelStore, resetLevelStore, getLevel, setLevel } from './levelStore';

function setup() {
    const container = document.createElement('div');
    container.id = 'level-selector';
    document.body.appendChild(container);
    return container;
}

function teardown(container: Element) {
    document.body.removeChild(container);
}

describe('initLevelSelector', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = setup();
        resetLevelStore();
        initLevelStore();
    });

    afterEach(() => {
        teardown(container);
        resetLevelStore();
    });

    it('renders a button for each audience level', () => {
        initLevelSelector();
        const buttons = container.querySelectorAll('[data-level]');
        expect(buttons).toHaveLength(4);
        const levels = Array.from(buttons).map(b => (b as HTMLElement).dataset.level);
        expect(levels).toEqual(['child', 'teenager', 'adult', 'researcher']);
    });

    it('marks the current level (adult by default) as active', () => {
        initLevelSelector();
        const activeBtn = container.querySelector('.level-btn--active') as HTMLElement;
        expect(activeBtn).not.toBeNull();
        expect(activeBtn.dataset.level).toBe('adult');
    });

    it('sets aria-pressed=true on the active button', () => {
        initLevelSelector();
        const activeBtn = container.querySelector<HTMLButtonElement>('[data-level="adult"]');
        expect(activeBtn?.getAttribute('aria-pressed')).toBe('true');
    });

    it('sets aria-pressed=false on inactive buttons', () => {
        initLevelSelector();
        const childBtn = container.querySelector<HTMLButtonElement>('[data-level="child"]');
        expect(childBtn?.getAttribute('aria-pressed')).toBe('false');
    });

    it('clicking a button updates the level store', () => {
        initLevelSelector();
        const childBtn = container.querySelector<HTMLButtonElement>('[data-level="child"]');
        childBtn?.click();
        expect(getLevel()).toBe('child');
    });

    it('clicking a button updates active class', () => {
        initLevelSelector();
        const teenBtn = container.querySelector<HTMLButtonElement>('[data-level="teenager"]');
        teenBtn?.click();
        expect(teenBtn?.classList.contains('level-btn--active')).toBe(true);
        const adultBtn = container.querySelector<HTMLButtonElement>('[data-level="adult"]');
        expect(adultBtn?.classList.contains('level-btn--active')).toBe(false);
    });

    it('external setLevel call updates button active states', () => {
        initLevelSelector();
        setLevel('researcher');
        const researcherBtn = container.querySelector<HTMLButtonElement>(
            '[data-level="researcher"]'
        );
        expect(researcherBtn?.classList.contains('level-btn--active')).toBe(true);
        expect(researcherBtn?.getAttribute('aria-pressed')).toBe('true');
    });

    it('does nothing if #level-selector is missing from DOM', () => {
        document.body.removeChild(container);
        // Should not throw
        expect(() => initLevelSelector()).not.toThrow();
        // Restore so afterEach teardown works (re-add empty)
        container = document.createElement('div');
        container.id = 'level-selector';
        document.body.appendChild(container);
    });
});
