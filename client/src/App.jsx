import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import HomeScreen from "./screens/HomeScreen";
import ThemeScreen from "./screens/ThemeScreen";
import GameModeScreen from "./screens/GameModeScreen";
import GameScreen from "./screens/GameScreen";
import { useThemeStore } from "./store/useThemeStore";
import { applyThemeToHtml, getThemeById } from "./utils/themeUtils";

const App = () => {
  const { currentTheme, themeConfig } = useThemeStore();
  const [themeApplied, setThemeApplied] = useState(false);

  // Apply theme whenever it changes
  useEffect(() => {
    if (currentTheme && themeConfig[currentTheme]) {
      const theme = getThemeById(currentTheme, themeConfig);
      applyThemeToHtml(theme);
      setThemeApplied(true);
    }
  }, [currentTheme, themeConfig]);

  // Show loading until theme is applied
  if (!themeApplied) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full relative ${currentTheme}`}>
      <div className="absolute inset-0 theme-bg z-0 transition-all duration-500"></div>

      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen w-full transition-all duration-500 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl mx-auto py-8">
          <Routes>
            <Route
              path="/"
              element={<HomeScreen />}
            />
            <Route
              path="/themes"
              element={<ThemeScreen />}
            />
            <Route
              path="/mode"
              element={<GameModeScreen />}
            />
            <Route
              path="/game"
              element={<GameScreen />}
            />
          </Routes>
        </div>
      </div>
    </div >
  );
};

export default App;
