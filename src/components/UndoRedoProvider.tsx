'use client';

import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';
import { useHotkeys } from '@/hooks/useHotkeys';

interface UndoRedoState<T> {
    past: T[];
    present: T;
    future: T[];
}

type Action<T> =
    | { type: 'UNDO' }
    | { type: 'REDO' }
    | { type: 'SET'; payload: T }
    | { type: 'CLEAR'; payload: T };

function undoRedoReducer<T>(state: UndoRedoState<T>, action: Action<T>): UndoRedoState<T> {
    const { past, present, future } = state;

    switch (action.type) {
        case 'UNDO': {
            if (past.length === 0) return state;
            const previous = past[past.length - 1];
            const newPast = past.slice(0, past.length - 1);
            return {
                past: newPast,
                present: previous,
                future: [present, ...future],
            };
        }

        case 'REDO': {
            if (future.length === 0) return state;
            const next = future[0];
            const newFuture = future.slice(1);
            return {
                past: [...past, present],
                present: next,
                future: newFuture,
            };
        }

        case 'SET': {
            // Don't add if it's the same as present
            if (JSON.stringify(action.payload) === JSON.stringify(present)) {
                return state;
            }
            return {
                past: [...past, present],
                present: action.payload,
                future: [],
            };
        }

        case 'CLEAR':
            return {
                past: [],
                present: action.payload,
                future: [],
            };

        default:
            return state;
    }
}

interface UndoRedoContextType<T> {
    state: T;
    setState: (newState: T) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    clear: (initialState: T) => void;
}

const UndoRedoContext = createContext<UndoRedoContextType<any> | null>(null);

interface UndoRedoProviderProps<T> {
    children: React.ReactNode;
    initialState: T;
    maxHistory?: number;
    onChange?: (state: T) => void;
}

export function UndoRedoProvider<T>({
    children,
    initialState,
    maxHistory = 50,
    onChange,
}: UndoRedoProviderProps<T>) {
    const [state, dispatch] = useReducer(undoRedoReducer<T>, {
        past: [],
        present: initialState,
        future: [],
    });

    const stateRef = useRef(state);
    stateRef.current = state;

    // Limit history size
    useEffect(() => {
        if (state.past.length > maxHistory) {
            dispatch({
                type: 'CLEAR',
                payload: state.present,
            });
        }
    }, [state.past.length, maxHistory, state.present]);

    // Call onChange when present changes
    useEffect(() => {
        onChange?.(state.present);
    }, [state.present, onChange]);

    const setState = useCallback((newState: T | ((prev: T) => T)) => {
        const resolvedState = typeof newState === 'function' 
            ? (newState as (prev: T) => T)(stateRef.current.present) 
            : newState;
        dispatch({ type: 'SET', payload: resolvedState });
    }, []);

    const undo = useCallback(() => {
        dispatch({ type: 'UNDO' });
    }, []);

    const redo = useCallback(() => {
        dispatch({ type: 'REDO' });
    }, []);

    const clear = useCallback((newInitialState: T) => {
        dispatch({ type: 'CLEAR', payload: newInitialState });
    }, []);

    // Keyboard shortcuts
    useHotkeys({
        'mod+z': (e) => {
            e.preventDefault();
            undo();
        },
        'mod+shift+z': (e) => {
            e.preventDefault();
            redo();
        },
        'mod+y': (e) => {
            e.preventDefault();
            redo();
        },
    });

    const value: UndoRedoContextType<T> = {
        state: state.present,
        setState,
        undo,
        redo,
        canUndo: state.past.length > 0,
        canRedo: state.future.length > 0,
        clear,
    };

    return (
        <UndoRedoContext.Provider value={value}>
            {children}
        </UndoRedoContext.Provider>
    );
}

export function useUndoRedo<T>(): UndoRedoContextType<T> {
    const context = useContext(UndoRedoContext);
    if (!context) {
        throw new Error('useUndoRedo must be used within an UndoRedoProvider');
    }
    return context;
}

// Hook for using undo/redo without context (for components that don't need the provider)
export function useLocalUndoRedo<T>(initialState: T, maxHistory = 50) {
    const [state, dispatch] = useReducer(undoRedoReducer<T>, {
        past: [],
        present: initialState,
        future: [],
    });

    // Ref to track current state for callback-style updates
    const stateRef = useRef(state);
    stateRef.current = state;

    // Limit history size
    useEffect(() => {
        if (state.past.length > maxHistory) {
            dispatch({
                type: 'CLEAR',
                payload: state.present,
            });
        }
    }, [state.past.length, maxHistory, state.present]);

    const setState = useCallback((newState: T | ((prev: T) => T)) => {
        const resolvedState = typeof newState === 'function' 
            ? (newState as (prev: T) => T)(stateRef.current.present) 
            : newState;
        dispatch({ type: 'SET', payload: resolvedState });
    }, []);

    const undo = useCallback(() => {
        dispatch({ type: 'UNDO' });
    }, []);

    const redo = useCallback(() => {
        dispatch({ type: 'REDO' });
    }, []);

    const clear = useCallback((newInitialState: T) => {
        dispatch({ type: 'CLEAR', payload: newInitialState });
    }, []);

    return {
        state: state.present,
        setState,
        undo,
        redo,
        canUndo: state.past.length > 0,
        canRedo: state.future.length > 0,
        clear,
    };
}
