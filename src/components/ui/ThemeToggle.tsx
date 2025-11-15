'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useEffect, useRef, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-5 w-5" />;
      case 'dark':
        return <Moon className="h-5 w-5" />;
      case 'system':
        return <Monitor className="h-5 w-5" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        aria-label="Toggle theme"
        title="Toggle theme"
      >
        {getIcon()}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 card-base border border-slate-200 dark:border-slate-700 shadow-lg rounded-lg overflow-hidden z-50">
          <div className="py-1">
            <button
              onClick={() => handleThemeChange('light')}
              className={`w-full px-4 py-2 text-left flex items-center gap-3 hover-bg transition-colors ${
                theme === 'light' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <Sun className="h-4 w-4" />
              <span className="font-medium">Light</span>
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`w-full px-4 py-2 text-left flex items-center gap-3 hover-bg transition-colors ${
                theme === 'dark' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <Moon className="h-4 w-4" />
              <span className="font-medium">Dark</span>
            </button>
            <button
              onClick={() => handleThemeChange('system')}
              className={`w-full px-4 py-2 text-left flex items-center gap-3 hover-bg transition-colors ${
                theme === 'system' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <Monitor className="h-4 w-4" />
              <span className="font-medium">System</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
