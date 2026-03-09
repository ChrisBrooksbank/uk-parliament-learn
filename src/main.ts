import { loadConfig } from '@config/index';
import { Logger } from '@utils/logger';

export function renderLoadingState(app: HTMLElement): void {
    app.innerHTML =
        '<div class="loading-state" role="status" aria-live="polite">Loading content&hellip;</div>';
}

export function renderErrorState(app: HTMLElement, message: string): void {
    app.innerHTML = `<div class="error-state" role="alert"><strong>Error:</strong> ${message}</div>`;
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
        Logger.success('Application mounted');
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        Logger.error('Failed to initialize:', message);
        renderErrorState(app, 'Failed to load application. Please refresh the page.');
    }
}

initApp();
