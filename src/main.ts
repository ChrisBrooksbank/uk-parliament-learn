import { loadConfig } from '@config/index';
import { loadTopics, loadCategories, loadGlossary } from '@api/index';
import { initRouter } from '@core/router';
import { initLevelStore, getLevel, onLevelChange } from '@core/levelStore';
import { initLevelSelector } from '@core/levelSelector';
import { renderHomePage } from './pages/home';
import { renderCategoryPage } from './pages/category';
import { renderTopicPage } from './pages/topic';
import { renderGlossaryPage } from './pages/glossary';
import { Logger } from '@utils/logger';
import type { Route } from '@core/router';

export function renderLoadingState(app: HTMLElement): void {
    app.innerHTML =
        '<div class="loading-state" role="status" aria-live="polite">Loading content&hellip;</div>';
}

export function renderErrorState(app: HTMLElement, message: string): void {
    app.innerHTML = `<div class="error-state" role="alert"><strong>Error:</strong> ${message}</div>`;
}

/**
 * Update aria-current="page" on main nav links to reflect the active route.
 */
export function updateNavAriaCurrent(route: Route): void {
    const navLinks = document.querySelectorAll<HTMLAnchorElement>('.main-nav a');
    for (const link of navLinks) {
        const href = link.getAttribute('href') ?? '';
        let isCurrent = false;
        if (route.name === 'home' && href === '#/') {
            isCurrent = true;
        } else if (route.name === 'glossary' && href === '#/glossary') {
            isCurrent = true;
        } else if (route.name === 'search' && href === '#/search') {
            isCurrent = true;
        }
        if (isCurrent) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    }
}

let currentRoute: Route | null = null;

function renderRoute(app: HTMLElement, route: Route): void {
    currentRoute = route;
    updateNavAriaCurrent(route);
    switch (route.name) {
        case 'home':
            renderHomePage(app);
            break;
        case 'category':
            renderCategoryPage(app, route.params.id);
            break;
        case 'topic':
            renderTopicPage(app, route.params.id, getLevel());
            break;
        case 'glossary':
            renderGlossaryPage(app);
            break;
        case 'search':
        case 'not-found':
            // Placeholder — implemented in later tasks
            app.innerHTML = `<p class="loading-state">Page coming soon: ${route.name}</p>`;
            break;
    }
}

export async function initApp(): Promise<void> {
    const app = document.getElementById('app');
    if (!app) {
        Logger.error('App mount point #app not found');
        return;
    }

    renderLoadingState(app);

    try {
        const config = await loadConfig();
        Logger.setDebugMode(config.debug);

        // Initialise audience level store and UI selector
        initLevelStore();
        initLevelSelector();

        // Re-render topic page when audience level changes
        onLevelChange(() => {
            if (currentRoute?.name === 'topic') {
                renderTopicPage(app, currentRoute.params.id, getLevel());
            }
        });

        // Pre-load content into cache
        loadTopics();
        loadCategories();
        loadGlossary();

        Logger.success('Application mounted');

        // Start router — renders the current route immediately
        initRouter((route: Route) => renderRoute(app, route));
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        Logger.error('Failed to initialize:', message);
        renderErrorState(app, 'Failed to load application. Please refresh the page.');
    }
}

initApp();
