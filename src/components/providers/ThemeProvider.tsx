'use client';

import { createContext, useContext, useEffect, useState } from 'react';

/**
 * Theme modes supported by the application
 * - 'light': Force light mode regardless of system preference
 * - 'dark': Force dark mode regardless of system preference
 * - 'system': Follow the operating system's theme preference
 */
type Theme = 'light' | 'dark' | 'system';

/**
 * Context type for theme management
 * @property theme - The current theme mode selected by the user
 * @property setTheme - Function to update the theme mode and persist to localStorage
 * @property resolvedTheme - The actual theme being applied ('light' or 'dark')
 */
interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * ThemeProvider component that manages theme state and applies it to the DOM
 * 
 * This provider:
 * 1. Manages the user's theme preference (light/dark/system)
 * 2. Resolves the actual theme to apply based on the preference
 * 3. Persists the preference to localStorage
 * 4. Applies the theme by adding CSS classes to the document root
 * 5. Listens for system preference changes when in 'system' mode
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Store the user's theme preference (defaults to 'system')
  const [theme, setThemeState] = useState<Theme>('system');
  
  // Store the resolved theme that's actually applied to the DOM
  // This is either the user's explicit choice or the system preference
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  /**
   * Effect: Initialize theme from localStorage on component mount
   * 
   * On first load, this checks if the user has a saved theme preference.
   * If found and valid, it restores that preference. Otherwise, defaults to 'system'.
   * This ensures the user's preference persists across sessions.
   */
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setThemeState(savedTheme);
    }
  }, []);

  /**
   * Effect: Resolve and update the actual theme based on user preference
   * 
   * This effect runs whenever the theme preference changes and:
   * 1. If theme is 'system', queries the OS preference using matchMedia
   * 2. If theme is 'light' or 'dark', uses that directly
   * 3. Sets up a listener for OS preference changes (only active when theme is 'system')
   * 
   * The listener ensures that if the user is in 'system' mode and changes their
   * OS theme, the app automatically updates to match.
   */
  useEffect(() => {
    const updateResolvedTheme = () => {
      if (theme === 'system') {
        // Query the operating system's current theme preference
        const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
        setResolvedTheme(systemPreference);
      } else {
        // User has explicitly chosen light or dark mode
        setResolvedTheme(theme);
      }
    };

    updateResolvedTheme();

    // Set up listener for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      // Only update if we're in system mode - otherwise ignore OS changes
      if (theme === 'system') {
        updateResolvedTheme();
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  /**
   * Effect: Apply the resolved theme to the document
   * 
   * This effect runs whenever the resolved theme changes and:
   * 1. Removes any existing theme classes from the root element
   * 2. Adds the appropriate class ('light' or 'dark') to the root element
   * 
   * The class on the root element triggers all the CSS dark mode rules
   * (defined as `.dark .class-name` in globals.css) to apply the correct styling.
   */
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove both theme classes to ensure clean state
    root.classList.remove('light', 'dark');
    
    // Add the resolved theme class to trigger CSS dark mode rules
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  /**
   * Update the theme preference and persist to localStorage
   * 
   * This function is exposed via context and called when the user
   * selects a theme from the ThemeToggle component.
   * 
   * @param newTheme - The theme mode to apply ('light', 'dark', or 'system')
   */
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Custom hook to access theme context
 * 
 * This hook provides access to the current theme state and the setTheme function.
 * It must be used within a component that's wrapped by ThemeProvider.
 * 
 * @throws Error if used outside of ThemeProvider
 * @returns ThemeContextType containing theme state and setter
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, setTheme, resolvedTheme } = useTheme();
 *   return <button onClick={() => setTheme('dark')}>Dark Mode</button>;
 * }
 * ```
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
