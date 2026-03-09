import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderLoadingState, renderErrorState, updateNavAriaCurrent } from './main';

describe('App shell rendering', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'app';
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('renderLoadingState sets loading content', () => {
        renderLoadingState(container);
        expect(container.innerHTML).toContain('Loading content');
        const status = container.querySelector('[role="status"]');
        expect(status).not.toBeNull();
    });

    it('renderLoadingState element has aria-live attribute', () => {
        renderLoadingState(container);
        const el = container.querySelector('[aria-live="polite"]');
        expect(el).not.toBeNull();
    });

    it('renderErrorState sets error content with message', () => {
        renderErrorState(container, 'Something went wrong');
        expect(container.innerHTML).toContain('Something went wrong');
    });

    it('renderErrorState element has role=alert', () => {
        renderErrorState(container, 'Test error');
        const alert = container.querySelector('[role="alert"]');
        expect(alert).not.toBeNull();
    });
});

describe('updateNavAriaCurrent', () => {
    let nav: HTMLElement;

    beforeEach(() => {
        nav = document.createElement('nav');
        nav.className = 'main-nav';
        nav.innerHTML = `
            <ul>
                <li><a href="#/">Home</a></li>
                <li><a href="#/glossary">Glossary</a></li>
                <li><a href="#/search">Search</a></li>
            </ul>
        `;
        document.body.appendChild(nav);
    });

    afterEach(() => {
        document.body.removeChild(nav);
    });

    it('sets aria-current=page on Home link for home route', () => {
        updateNavAriaCurrent({ name: 'home' });
        const homeLink = nav.querySelector<HTMLAnchorElement>('a[href="#/"]');
        expect(homeLink?.getAttribute('aria-current')).toBe('page');
    });

    it('removes aria-current from non-active links on home route', () => {
        updateNavAriaCurrent({ name: 'home' });
        const glossaryLink = nav.querySelector<HTMLAnchorElement>('a[href="#/glossary"]');
        expect(glossaryLink?.hasAttribute('aria-current')).toBe(false);
    });

    it('sets aria-current=page on Glossary link for glossary route', () => {
        updateNavAriaCurrent({ name: 'glossary' });
        const glossaryLink = nav.querySelector<HTMLAnchorElement>('a[href="#/glossary"]');
        expect(glossaryLink?.getAttribute('aria-current')).toBe('page');
        const homeLink = nav.querySelector<HTMLAnchorElement>('a[href="#/"]');
        expect(homeLink?.hasAttribute('aria-current')).toBe(false);
    });

    it('sets aria-current=page on Search link for search route', () => {
        updateNavAriaCurrent({ name: 'search' });
        const searchLink = nav.querySelector<HTMLAnchorElement>('a[href="#/search"]');
        expect(searchLink?.getAttribute('aria-current')).toBe('page');
    });

    it('clears all aria-current attributes for category route', () => {
        updateNavAriaCurrent({ name: 'category', params: { id: 'parliament-basics' } });
        const links = nav.querySelectorAll<HTMLAnchorElement>('a');
        for (const link of links) {
            expect(link.hasAttribute('aria-current')).toBe(false);
        }
    });

    it('clears all aria-current attributes for topic route', () => {
        updateNavAriaCurrent({ name: 'topic', params: { id: 'what-is-parliament' } });
        const links = nav.querySelectorAll<HTMLAnchorElement>('a');
        for (const link of links) {
            expect(link.hasAttribute('aria-current')).toBe(false);
        }
    });
});
