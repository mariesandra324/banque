import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

const CLE_STOCKAGE = 'theme';

function lireThemeInitial() {
  const stocke = localStorage.getItem(CLE_STOCKAGE);
  if (stocke === 'light' || stocke === 'dark') return stocke;
  // Pas de préférence enregistrée : on suit la préférence système par défaut
  const preferesSombre = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return preferesSombre ? 'dark' : 'light';
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(lireThemeInitial);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(CLE_STOCKAGE, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((precedent) => (precedent === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);
