"use client";

import { useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export default function ThemeToggle() {
  const { theme, changeTheme, isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { value: 'light', label: 'Clair', icon: Sun },
    { value: 'dark', label: 'Sombre', icon: Moon },
    { value: 'system', label: 'Système', icon: Monitor },
  ] as const;

  const currentTheme = themes.find(t => t.value === theme) || themes[2];

  return (
    <div className="relative">
      {/* Bouton principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-gray-200/20 hover:bg-white/20 transition-all duration-200 group"
        aria-label="Changer le thème"
      >
        <currentTheme.icon 
          className={`w-5 h-5 transition-all duration-200 ${
            isDark ? 'text-white' : 'text-gray-700'
          } group-hover:scale-110`} 
        />
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <>
          {/* Overlay pour fermer */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-12 w-48 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200/20 dark:border-gray-700/20 rounded-xl shadow-xl z-50 overflow-hidden">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon;
              const isActive = theme === themeOption.value;
              
              return (
                <button
                  key={themeOption.value}
                  onClick={() => {
                    changeTheme(themeOption.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 ${
                    isActive 
                      ? 'bg-pink-100/50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{themeOption.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-pink-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
} 