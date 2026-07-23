"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Generic undo/redo stack.
 * Call `push(snapshot)` before a mutation (or after completing a drag).
 */
export function useHistory<T>(initial: T, limit = 50) {
  const [, bump] = useState(0);
  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);
  const present = useRef<T>(initial);

  const canUndo = past.current.length > 0;
  const canRedo = future.current.length > 0;

  const replace = useCallback((next: T, options?: { record?: boolean }) => {
    if (options?.record !== false) {
      past.current = [...past.current, present.current].slice(-limit);
      future.current = [];
    }
    present.current = next;
    bump((n) => n + 1);
  }, [limit]);

  const setPresentSilent = useCallback((next: T) => {
    present.current = next;
    bump((n) => n + 1);
  }, []);

  const undo = useCallback(() => {
    if (past.current.length === 0) return present.current;
    const previous = past.current[past.current.length - 1];
    past.current = past.current.slice(0, -1);
    future.current = [present.current, ...future.current];
    present.current = previous;
    bump((n) => n + 1);
    return previous;
  }, []);

  const redo = useCallback(() => {
    if (future.current.length === 0) return present.current;
    const next = future.current[0];
    future.current = future.current.slice(1);
    past.current = [...past.current, present.current];
    present.current = next;
    bump((n) => n + 1);
    return next;
  }, []);

  const reset = useCallback((next: T) => {
    past.current = [];
    future.current = [];
    present.current = next;
    bump((n) => n + 1);
  }, []);

  return {
    present: present.current,
    canUndo,
    canRedo,
    replace,
    setPresentSilent,
    undo,
    redo,
    reset,
  };
}
