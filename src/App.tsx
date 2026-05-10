import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { EditorPage } from './pages/EditorPage';


function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('struct_theme') as 'light' | 'dark') || 'light';
  });
  const [themeColor, setThemeColor] = useState<string>(() => {
    return localStorage.getItem('struct_theme_color') || '#f97316';
  });

  useEffect(() => {
    localStorage.setItem('struct_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('struct_theme_color', themeColor);
    const color = themeColor || '#f97316';
    document.documentElement.style.setProperty('--accent-primary', color);
    
    // Update dynamic favicon
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect width="32" height="32" rx="0" fill="${color}" />
      <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="monospace" font-weight="900" font-size="20" fill="white">S</text>
    </svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
    if (link) {
      link.href = url;
    }
    return () => URL.revokeObjectURL(url);
  }, [themeColor]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home theme={theme} toggleTheme={toggleTheme} themeColor={themeColor} setThemeColor={setThemeColor} />} />
        <Route path="/editor" element={<EditorPage theme={theme} toggleTheme={toggleTheme} themeColor={themeColor} setThemeColor={setThemeColor} />} />
        <Route path="/editor/:schemaId" element={<EditorPage theme={theme} toggleTheme={toggleTheme} themeColor={themeColor} setThemeColor={setThemeColor} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
