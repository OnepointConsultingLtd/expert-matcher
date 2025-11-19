import { useEffect } from "react";
import { useAppStore } from "../context/AppStore";


export function useDarkMode() {
  const { darkMode, setDarkMode } = useAppStore();

  useEffect(() => {
    // Check initial state
    const checkDarkMode = () => {
      // Method 1: Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      // Method 2: Check if dark class exists on document/html (if using class-based dark mode)
      const hasDarkClass = document.documentElement.classList.contains('dark');

      // Use either method or combine them
      setDarkMode(prefersDark || hasDarkClass);
    };

    checkDarkMode();

    // Listen for changes in system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setDarkMode(e.matches);

    // Modern browsers
    mediaQuery.addEventListener('change', handleChange);

    // Fallback for older browsers
    // mediaQuery.addListener(handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
  return { darkMode, setDarkMode }
}