'use client';

import { useEffect, useRef, useCallback } from 'react';

type HotkeyCallback = (event: KeyboardEvent) => void;

interface HotkeyMap {
    [key: string]: HotkeyCallback;
}

/**
 * Custom hook for handling keyboard shortcuts
 * Supports: 'mod' (Cmd/Ctrl), 'shift', 'alt', 'ctrl'
 * Examples: 'mod+z', 'mod+shift+z', 'ctrl+y', 'escape', 'enter'
 */
export function useHotkeys(hotkeys: HotkeyMap, enabled = true) {
    const hotkeysRef = useRef(hotkeys);

    useEffect(() => {
        hotkeysRef.current = hotkeys;
    }, [hotkeys]);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (!enabled) return;

        // Don't trigger shortcuts when typing in input fields
        const target = event.target as HTMLElement;
        if (
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.contentEditable === 'true'
        ) {
            // Allow some shortcuts even in inputs (like escape)
            const key = getKeyCombo(event);
            if (key !== 'escape' && !key.startsWith('mod+enter')) {
                return;
            }
        }

        const keyCombo = getKeyCombo(event);
        const callback = hotkeysRef.current[keyCombo];

        if (callback) {
            callback(event);
        }
    }, [enabled]);

    useEffect(() => {
        if (!enabled) return;

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown, enabled]);
}

function getKeyCombo(event: KeyboardEvent): string {
    const parts: string[] = [];

    if (event.metaKey) parts.push('mod');
    if (event.ctrlKey && !event.metaKey) parts.push('ctrl');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');

    let key = event.key.toLowerCase();
    
    // Normalize some keys
    if (key === ' ') key = 'space';
    if (key === 'escape') key = 'escape';
    if (key === 'enter') key = 'enter';
    if (key === 'tab') key = 'tab';
    if (key === 'backspace') key = 'backspace';
    if (key === 'delete') key = 'delete';
    if (key === 'arrowup') key = 'up';
    if (key === 'arrowdown') key = 'down';
    if (key === 'arrowleft') key = 'left';
    if (key === 'arrowright') key = 'right';

    parts.push(key);

    return parts.join('+');
}

// Hook for a single hotkey
export function useHotkey(
    key: string,
    callback: HotkeyCallback,
    enabled = true
) {
    const hotkeys: HotkeyMap = { [key]: callback };
    useHotkeys(hotkeys, enabled);
}
