import React, { createContext, useContext, useState, useEffect } from 'react';

const AppSettingsContext = createContext();

const defaultSettings = {
  appName: 'Pears',
  slogan: 'Paired for Production, Performance, Partnership',
  logoType: 'default', // 'default', 'emoji', 'custom'
  customLogoUrl: '',
  logoEmoji: '🍐',
};

export const AppSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('pearsAppSettings');
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('pearsAppSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('pearsAppSettings');
  };

  return (
    <AppSettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
};
