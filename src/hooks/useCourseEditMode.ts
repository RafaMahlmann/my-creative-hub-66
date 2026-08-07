import { useSyncExternalStore } from 'react';
import { useAdminAuth } from './useAdminAuth';

const KEY = 'course-edit-mode';
const listeners = new Set<() => void>();

let value = (() => {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
})();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return value;
}

export function setCourseEditMode(next: boolean) {
  value = next;
  try {
    localStorage.setItem(KEY, next ? '1' : '0');
  } catch {
    // localStorage pode estar indisponível em iframes
  }
  listeners.forEach((cb) => cb());
}

/** Modo edição da vitrine de cursos — só vale para administradores. */
export function useCourseEditMode() {
  const { isAdmin, loading } = useAdminAuth();
  const enabled = useSyncExternalStore(subscribe, getSnapshot, () => false);

  return {
    isAdmin,
    loading,
    enabled,
    editing: isAdmin && enabled,
    setEnabled: setCourseEditMode,
    toggle: () => setCourseEditMode(!enabled),
  };
}
