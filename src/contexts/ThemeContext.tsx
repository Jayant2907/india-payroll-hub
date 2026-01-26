import React, { createContext, useContext, useState, useEffect } from 'react';
import { getThemeConfig, setThemeConfig } from '@/lib/storage';
import type { ThemeConfig } from '@/types/payroll';

interface ThemeContextType {
  theme: 'dark' | 'light';
  themeConfig: ThemeConfig;
  toggleTheme: () => void;
  updateThemeConfig: (config: Partial<ThemeConfig>) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DEFAULT_THEME: ThemeConfig = {
  mode: 'dark',
  primaryColor: 'hsl(262, 80%, 60%)',
  sidebarColor: 'hsl(240, 10%, 8%)',
  backgroundColor: 'hsl(240, 10%, 6%)',
  chartColors: ['hsl(262, 80%, 65%)', 'hsl(173, 80%, 50%)', 'hsl(47, 96%, 58%)', 'hsl(340, 75%, 60%)', 'hsl(24, 95%, 58%)'],
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeConfig, setThemeConfigState] = useState<ThemeConfig>(getThemeConfig);

  useEffect(() => {
    // Apply theme class to document
    document.documentElement.classList.toggle('dark', themeConfig.mode === 'dark');
  }, [themeConfig.mode]);

  const toggleTheme = () => {
    const newMode: 'dark' | 'light' = themeConfig.mode === 'dark' ? 'light' : 'dark';
    const newConfig: ThemeConfig = { ...themeConfig, mode: newMode };
    setThemeConfigState(newConfig);
    setThemeConfig(newConfig);
  };

  const updateThemeConfig = (config: Partial<ThemeConfig>) => {
    const newConfig = { ...themeConfig, ...config };
    setThemeConfigState(newConfig);
    setThemeConfig(newConfig);
  };

  const resetTheme = () => {
    setThemeConfigState(DEFAULT_THEME);
    setThemeConfig(DEFAULT_THEME);
  };

  return (
    <ThemeContext.Provider value={{ theme: themeConfig.mode, themeConfig, toggleTheme, updateThemeConfig, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
