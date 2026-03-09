import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseHash, navigate, initRouter } from './router';

describe('parseHash', () => {
    it('returns home for empty hash', () => {
        expect(parseHash('')).toEqual({ name: 'home' });
    });

    it('returns home for "#"', () => {
        expect(parseHash('#')).toEqual({ name: 'home' });
    });

    it('returns home for "#/"', () => {
        expect(parseHash('#/')).toEqual({ name: 'home' });
    });

    it('returns home for bare "/"', () => {
        expect(parseHash('/')).toEqual({ name: 'home' });
    });

    it('returns category route with id', () => {
        expect(parseHash('#/category/parliament-basics')).toEqual({
            name: 'category',
            params: { id: 'parliament-basics' },
        });
    });

    it('returns topic route with id', () => {
        expect(parseHash('#/topic/house-of-commons')).toEqual({
            name: 'topic',
            params: { id: 'house-of-commons' },
        });
    });

    it('returns glossary route', () => {
        expect(parseHash('#/glossary')).toEqual({ name: 'glossary' });
    });

    it('returns search route', () => {
        expect(parseHash('#/search')).toEqual({ name: 'search' });
    });

    it('returns not-found for unknown path', () => {
        expect(parseHash('#/unknown/path')).toEqual({
            name: 'not-found',
            path: '/unknown/path',
        });
    });

    it('does not match category with trailing slash', () => {
        const result = parseHash('#/category/foo/');
        expect(result.name).toBe('not-found');
    });

    it('does not match topic with sub-path', () => {
        const result = parseHash('#/topic/foo/bar');
        expect(result.name).toBe('not-found');
    });
});

describe('navigate', () => {
    it('sets window.location.hash', () => {
        navigate('/category/parliament-basics');
        expect(window.location.hash).toBe('#/category/parliament-basics');
    });

    it('sets hash to / for home', () => {
        navigate('/');
        expect(window.location.hash).toBe('#/');
    });
});

describe('initRouter', () => {
    beforeEach(() => {
        window.location.hash = '';
    });

    afterEach(() => {
        window.location.hash = '';
    });

    it('calls handler immediately with current route', () => {
        window.location.hash = '#/glossary';
        const handler = vi.fn();
        const cleanup = initRouter(handler);
        expect(handler).toHaveBeenCalledOnce();
        expect(handler).toHaveBeenCalledWith({ name: 'glossary' });
        cleanup();
    });

    it('calls handler again on hashchange', () => {
        const handler = vi.fn();
        const cleanup = initRouter(handler);

        window.location.hash = '#/category/elections-and-representation';
        window.dispatchEvent(new HashChangeEvent('hashchange'));

        expect(handler).toHaveBeenCalledTimes(2);
        expect(handler).toHaveBeenLastCalledWith({
            name: 'category',
            params: { id: 'elections-and-representation' },
        });
        cleanup();
    });

    it('cleanup removes the hashchange listener', () => {
        const handler = vi.fn();
        const cleanup = initRouter(handler);
        cleanup();

        const callsBefore = handler.mock.calls.length;
        window.location.hash = '#/search';
        window.dispatchEvent(new HashChangeEvent('hashchange'));

        expect(handler.mock.calls.length).toBe(callsBefore);
    });
});
