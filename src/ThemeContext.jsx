import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Predefined themes
const themes = {
  light: {
    name: 'Light',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    cardBg: 'rgba(255, 255, 255, 0.9)',
    textPrimary: '#1a202c',
    textSecondary: '#4a5568',
    accent: '#667eea',
    accentSecondary: '#764ba2',
    border: 'rgba(0, 0, 0, 0.1)',
    shadow: 'rgba(0, 0, 0, 0.1)',
    navBg: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.45))',
  },
  dark: {
    name: 'Dark',
    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
    cardBg: 'rgba(30, 41, 59, 0.25)',
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5e1',
    accent: '#818cf8',
    accentSecondary: '#a78bfa',
    border: 'rgba(129, 140, 248, 0.2)',
    shadow: 'rgba(0, 0, 0, 0.4)',
    navBg: 'rgba(15, 23, 42, 0.8)',
    glass: {
      background: 'rgba(30, 41, 59, 0.4)',
      backdropFilter: 'blur(12px) saturate(160%)',
      border: '1px solid rgba(129, 140, 248, 0.2)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
    },
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  },
  custom: {
    name: 'Custom',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    cardBg: 'rgba(255, 255, 255, 0.1)',
    textPrimary: '#ffffff',
    textSecondary: '#e2e8f0',
    accent: '#fbbf24',
    accentSecondary: '#f59e0b',
    border: 'rgba(255, 255, 255, 0.2)',
    shadow: 'rgba(0, 0, 0, 0.2)',
    navBg: 'linear-gradient(135deg, rgba(102, 126, 234, 0.32), rgba(118, 75, 162, 0.2))',
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [customColors, setCustomColors] = useState(themes.custom);

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('appTheme');
    const savedCustomColors = localStorage.getItem('customThemeColors');
    
    if (savedTheme) {
      setCurrentTheme(savedTheme);
    }
    
    if (savedCustomColors) {
      try {
        setCustomColors(JSON.parse(savedCustomColors));
      } catch (e) {
        console.error('Failed to parse custom colors:', e);
      }
    }
  }, []);

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem('appTheme', currentTheme);
  }, [currentTheme]);

  // Save custom colors to localStorage
  useEffect(() => {
    if (currentTheme === 'custom') {
      localStorage.setItem('customThemeColors', JSON.stringify(customColors));
    }
  }, [customColors, currentTheme]);

  const changeTheme = (themeName) => {
    setCurrentTheme(themeName);
  };

  const updateCustomColor = (colorKey, colorValue) => {
    setCustomColors(prev => ({
      ...prev,
      [colorKey]: colorValue
    }));
  };

  const resetCustomTheme = () => {
    setCustomColors(themes.custom);
  };

  const toggleTheme = () => {
    setCurrentTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const getTheme = () => {
    if (currentTheme === 'custom') {
      return customColors;
    }
    return themes[currentTheme] || themes.dark;
  };

  const value = {
    currentTheme,
    theme: getTheme(),
    themes,
    changeTheme,
    toggleTheme,
    isDark: currentTheme === 'dark',
    customColors,
    updateCustomColor,
    resetCustomTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
