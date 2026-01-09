import { useEffect } from 'react';
import { useTheme } from 'next-themes';

// Ensures the data-theme attribute matches the active theme, including system changes.
export function ThemeWatcher() {
  const { theme, systemTheme } = useTheme();

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const resolveTheme = () => {
      if (theme === 'system') {
        return media.matches ? 'dark' : 'light';
      }
      return theme ?? 'light';
    };

    const apply = () => {
      const next = resolveTheme();
      document.documentElement.setAttribute('data-theme', next);
    };

    apply();

    if (theme === 'system') {
      media.addEventListener('change', apply);
      return () => media.removeEventListener('change', apply);
    }
    return undefined;
  }, [theme, systemTheme]);

  return null;
}
