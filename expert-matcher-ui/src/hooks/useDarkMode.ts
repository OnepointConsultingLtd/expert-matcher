import { useEffect } from "react";
import { useAppStore } from "../context/AppStore";

const DARK_MODE_STORAGE_KEY = 'expert-matcher-dark-mode';

export function useDarkMode() {
  const { darkMode, setDarkMode } = useAppStore();

  useEffect(() => {
    // Ensure DOM class matches the store state on mount
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Listen for changes in system preference (only if no user preference is saved)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const hasUserPreference = localStorage.getItem(DARK_MODE_STORAGE_KEY) !== null;
      if (!hasUserPreference) {
        setDarkMode(e.matches);
      }
    };

    // Modern browsers
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [darkMode, setDarkMode]);

  return { darkMode, setDarkMode }
}