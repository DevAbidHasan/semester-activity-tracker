import { useLayoutEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * Tracks whether `document.documentElement` has the `dark` class (after ThemeProvider runs).
 * Updates when theme preference changes or when the class is toggled (e.g. system scheme change).
 */
export function useHtmlDarkClass() {
  const { theme } = useTheme();
  const [isDark, setIsDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  useLayoutEffect(() => {
    const el = document.documentElement;
    const read = () => setIsDark(el.classList.contains('dark'));
    read();
    const mo = new MutationObserver(read);
    mo.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, [theme]);

  return isDark;
}
