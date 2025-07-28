import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Charger le thème depuis localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }

    // Détecter le thème système
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateResolvedTheme = () => {
      let newResolvedTheme: 'light' | 'dark';
      
      if (theme === 'system') {
        newResolvedTheme = mediaQuery.matches ? 'dark' : 'light';
      } else {
        newResolvedTheme = theme;
      }
      
      setResolvedTheme(newResolvedTheme);
      
      // Appliquer le thème au document
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(newResolvedTheme);
      
      // Mettre à jour les variables CSS
      if (newResolvedTheme === 'dark') {
        document.documentElement.style.setProperty('--background', '#0a0a0a');
        document.documentElement.style.setProperty('--foreground', '#ededed');
      } else {
        document.documentElement.style.setProperty('--background', '#ffffff');
        document.documentElement.style.setProperty('--foreground', '#171717');
      }
    };

    updateResolvedTheme();

    // Écouter les changements de thème système
    mediaQuery.addEventListener('change', updateResolvedTheme);

    return () => {
      mediaQuery.removeEventListener('change', updateResolvedTheme);
    };
  }, [theme]);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return {
    theme,
    resolvedTheme,
    changeTheme,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
  };
} 