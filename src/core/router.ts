/**
 * Hash-based client-side router.
 *
 * Routes:
 *   /               → { name: 'home' }
 *   /category/:id   → { name: 'category', params: { id } }
 *   /topic/:id      → { name: 'topic', params: { id } }
 *   /glossary       → { name: 'glossary' }
 *   /search         → { name: 'search' }
 *   <anything else> → { name: 'not-found', path }
 */

export type Route =
    | { name: 'home' }
    | { name: 'category'; params: { id: string } }
    | { name: 'topic'; params: { id: string } }
    | { name: 'glossary' }
    | { name: 'search' }
    | { name: 'not-found'; path: string };

export type RouteHandler = (route: Route) => void;

/**
 * Parse a hash string (e.g. `#/category/foo` or `/category/foo`) into a Route.
 */
export function parseHash(hash: string): Route {
    // Strip leading `#` and ensure a leading `/`
    const path = hash.replace(/^#/, '') || '/';

    if (path === '/' || path === '') {
        return { name: 'home' };
    }

    const categoryMatch = path.match(/^\/category\/([^/]+)$/);
    if (categoryMatch) {
        return { name: 'category', params: { id: categoryMatch[1]! } };
    }

    const topicMatch = path.match(/^\/topic\/([^/]+)$/);
    if (topicMatch) {
        return { name: 'topic', params: { id: topicMatch[1]! } };
    }

    if (path === '/glossary') {
        return { name: 'glossary' };
    }

    if (path === '/search') {
        return { name: 'search' };
    }

    return { name: 'not-found', path };
}

/**
 * Navigate to a path by updating the location hash.
 * @param path e.g. `/`, `/category/parliament-basics`, `/topic/foo`
 */
export function navigate(path: string): void {
    window.location.hash = path;
}

/**
 * Initialise the router. Calls `handler` immediately with the current route,
 * then again on every subsequent `hashchange`.
 *
 * @returns A cleanup function that removes the event listener.
 */
export function initRouter(handler: RouteHandler): () => void {
    const onHashChange = (): void => {
        const route = parseHash(window.location.hash);
        handler(route);
    };

    window.addEventListener('hashchange', onHashChange);

    // Fire immediately for the current hash
    onHashChange();

    return () => {
        window.removeEventListener('hashchange', onHashChange);
    };
}
