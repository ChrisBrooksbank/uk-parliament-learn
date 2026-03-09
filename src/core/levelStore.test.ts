import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    getLevel,
    setLevel,
    onLevelChange,
    initLevelStore,
    resetLevelStore,
    AUDIENCE_LEVELS,
    type AudienceLevel,
} from './levelStore';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
        clear: () => {
            store = {};
        },
    };
})();

Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    writable: true,
});

beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    resetLevelStore();
});

describe('AUDIENCE_LEVELS', () => {
    it('contains all four levels', () => {
        expect(AUDIENCE_LEVELS).toEqual(['child', 'teenager', 'adult', 'researcher']);
    });
});

describe('initLevelStore', () => {
    it('defaults to "adult" when no stored value', () => {
        initLevelStore();
        expect(getLevel()).toBe('adult');
    });

    it('loads persisted level from localStorage', () => {
        localStorageMock.getItem.mockReturnValueOnce('researcher');
        initLevelStore();
        expect(getLevel()).toBe('researcher');
    });

    it('ignores invalid stored values and defaults to "adult"', () => {
        localStorageMock.getItem.mockReturnValueOnce('invalid-level');
        initLevelStore();
        expect(getLevel()).toBe('adult');
    });

    it('is a no-op on subsequent calls', () => {
        initLevelStore();
        setLevel('child');
        initLevelStore(); // second call should not reset
        expect(getLevel()).toBe('child');
    });
});

describe('setLevel', () => {
    beforeEach(() => initLevelStore());

    it('sets the current level', () => {
        setLevel('teenager');
        expect(getLevel()).toBe('teenager');
    });

    it('persists the level to localStorage', () => {
        setLevel('researcher');
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            'uk-parliament-learn:audience-level',
            'researcher'
        );
    });

    it.each<AudienceLevel>(['child', 'teenager', 'adult', 'researcher'])(
        'accepts valid level "%s"',
        level => {
            setLevel(level);
            expect(getLevel()).toBe(level);
        }
    );

    it('throws on invalid level', () => {
        expect(() => setLevel('invalid' as AudienceLevel)).toThrow('Invalid audience level');
    });
});

describe('onLevelChange', () => {
    beforeEach(() => initLevelStore());

    it('notifies listeners when level changes', () => {
        const listener = vi.fn();
        onLevelChange(listener);
        setLevel('child');
        expect(listener).toHaveBeenCalledWith('child');
    });

    it('notifies multiple listeners', () => {
        const a = vi.fn();
        const b = vi.fn();
        onLevelChange(a);
        onLevelChange(b);
        setLevel('teenager');
        expect(a).toHaveBeenCalledWith('teenager');
        expect(b).toHaveBeenCalledWith('teenager');
    });

    it('unsubscribes listener when returned function is called', () => {
        const listener = vi.fn();
        const unsub = onLevelChange(listener);
        unsub();
        setLevel('child');
        expect(listener).not.toHaveBeenCalled();
    });

    it('does not call listener again after unsubscribe', () => {
        const listener = vi.fn();
        const unsub = onLevelChange(listener);
        setLevel('child');
        unsub();
        setLevel('teenager');
        expect(listener).toHaveBeenCalledTimes(1);
    });
});

describe('resetLevelStore', () => {
    it('resets level to default', () => {
        initLevelStore();
        setLevel('child');
        resetLevelStore();
        initLevelStore();
        expect(getLevel()).toBe('adult');
    });

    it('clears listeners', () => {
        initLevelStore();
        const listener = vi.fn();
        onLevelChange(listener);
        resetLevelStore();
        initLevelStore();
        setLevel('child');
        expect(listener).not.toHaveBeenCalled();
    });
});
