let tooltipEl: HTMLDivElement | null = null;
let currentTarget: HTMLElement | null = null;
let boundDocClick: ((e: MouseEvent) => void) | null = null;
let boundDocKey: ((e: KeyboardEvent) => void) | null = null;

function ensureTooltipEl(): HTMLDivElement {
    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.className = 'glossary-tooltip';
        tooltipEl.setAttribute('role', 'tooltip');
        tooltipEl.id = 'glossary-tooltip';
        document.body.appendChild(tooltipEl);

        boundDocClick = (e: MouseEvent) => {
            if (
                tooltipEl &&
                currentTarget &&
                !currentTarget.contains(e.target as Node) &&
                !tooltipEl.contains(e.target as Node)
            ) {
                hideTooltip();
            }
        };
        document.addEventListener('click', boundDocClick);

        boundDocKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') hideTooltip();
        };
        document.addEventListener('keydown', boundDocKey);
    }
    return tooltipEl;
}

function positionTooltip(target: HTMLElement, el: HTMLDivElement): void {
    const rect = target.getBoundingClientRect();
    const elHeight = el.offsetHeight || 0;
    const elWidth = el.offsetWidth || 0;

    let left = rect.left;
    let top = rect.top - elHeight - 8;

    // Clamp horizontally within viewport
    const vw = window.innerWidth || 0;
    if (left + elWidth > vw - 8) {
        left = vw - elWidth - 8;
    }
    if (left < 8) left = 8;

    // Flip below term if not enough space above
    if (top < 8) {
        top = rect.bottom + 8;
    }

    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
}

function showTooltip(target: HTMLElement): void {
    const definition = target.getAttribute('title') ?? '';
    if (!definition) return;

    const el = ensureTooltipEl();
    el.textContent = definition;
    el.classList.add('glossary-tooltip--visible');

    positionTooltip(target, el);
    currentTarget = target;
}

function hideTooltip(): void {
    if (!tooltipEl) return;
    tooltipEl.classList.remove('glossary-tooltip--visible');
    currentTarget = null;
}

/**
 * Attach hover (desktop) and tap (mobile) tooltip handlers to all
 * `.glossary-term` elements inside the given container.
 *
 * A single shared tooltip element is created in `document.body` on first use.
 * Clicking outside or pressing Escape dismisses the tooltip.
 */
export function attachGlossaryTooltips(container: HTMLElement): void {
    const terms = container.querySelectorAll<HTMLElement>('abbr.glossary-term');
    for (const term of terms) {
        term.addEventListener('mouseenter', () => showTooltip(term));
        term.addEventListener('mouseleave', hideTooltip);
        term.addEventListener('click', (e: MouseEvent) => {
            e.stopPropagation();
            if (currentTarget === term) {
                hideTooltip();
            } else {
                showTooltip(term);
            }
        });
    }
}

/**
 * Remove the singleton tooltip element and detach document-level listeners.
 * Exposed for use in tests only.
 */
export function _resetTooltipForTest(): void {
    if (tooltipEl) {
        tooltipEl.remove();
        tooltipEl = null;
    }
    if (boundDocClick) {
        document.removeEventListener('click', boundDocClick);
        boundDocClick = null;
    }
    if (boundDocKey) {
        document.removeEventListener('keydown', boundDocKey);
        boundDocKey = null;
    }
    currentTarget = null;
}
