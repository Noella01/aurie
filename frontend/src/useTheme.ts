import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';
const storageKey = 'lenos-theme';

export function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch { /* Storage may be disabled. */ }
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: light)');
    const syncSystem = () => {
      try { if (localStorage.getItem(storageKey)) return; } catch { /* Use system preference. */ }
      setTheme(query.matches ? 'light' : 'dark');
    };
    const syncStorage = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === null) setTheme(getInitialTheme());
    };
    query.addEventListener('change', syncSystem);
    window.addEventListener('storage', syncStorage);
    return () => {
      query.removeEventListener('change', syncSystem);
      window.removeEventListener('storage', syncStorage);
    };
  }, []);
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(storageKey, next); } catch { /* Still allow switching this visit. */ }
    setTheme(next);
  };
  return { theme, toggleTheme };
}
