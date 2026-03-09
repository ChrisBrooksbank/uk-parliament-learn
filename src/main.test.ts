import { describe, it, expect, beforeEach } from 'vitest';
import { renderLoadingState, renderErrorState } from './main';

describe('App shell rendering', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'app';
        document.body.appendChild(container);
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
