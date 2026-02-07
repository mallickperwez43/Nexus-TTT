import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import HomeScreen from "./screens/HomeScreen";
import ThemeScreen from "./screens/ThemeScreen";
import GameModeScreen from "./screens/GameModeScreen";
import GameScreen from "./screens/GameScreen";
import { LoaderFive } from "./components/ui/loader"; // Import the one you just got
import { useThemeStore } from "./store/useThemeStore";
import { getThemeById, applyThemeToHtml } from "./utils/themeUtils";

const loadingStates = [
  "Initializing Nexus Core",
  "Syncing Heuristic AI",
  "Loading Theme Assets",
  "Establishing Neural Link",
  "Deploying NxN Grid",
  "System Online",
];

const App = () => {
  const { currentTheme, themeConfig } = useThemeStore();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const theme = getThemeById(currentTheme, themeConfig);
    applyThemeToHtml(theme);
  }, [currentTheme, themeConfig]);

  useEffect(() => {
    if (loading) {
      const stepInterval = setInterval(() => {
        setStep((prev) => {
          if (prev >= loadingStates.length - 1) {
            clearInterval(stepInterval);
            setTimeout(() => setLoading(false), 500); // Small pause at the end
            return prev;
          }
          return prev + 1;
        });
      }, 1000); // Speed of text change

      return () => clearInterval(stepInterval);
    }
  }, [loading]);

  return (
    <div
      className="min-h-screen w-full relative transition-colors duration-500"
      style={{ backgroundColor: "var(--bg-color" }}
    >
      {/* 1. Cinematic Loader Overlay */}
      {loading && (
        <div
          className="fixed inset-0 z-100 flex flex-col items-center justify-center p-4 transition-colors duration-500"
          style={{ backgroundColor: "var(--bg-color)" }} // Loader background matches theme
        >
          <div className="flex flex-col items-center justify-center min-h-[200px]">
            <LoaderFive text={loadingStates[step]} />

            <p
              className="mt-8 text-[12px] font-bold uppercase tracking-[0.6em] animate-pulse opacity-70"
              style={{ color: "var(--text-color)" }} // Sub-text matches theme
            >
              System Protocol: Active
            </p>
          </div>
        </div>
      )}

      {/* 2. Main Game Content */}
      {!loading && (
        <div className="relative z-10 flex flex-col items-center justify-start min-h-screen w-full transition-all duration-1000 animate-in fade-in fill-mode-both">
          <div className="w-full max-w-5xl mx-auto py-8">
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/themes" element={<ThemeScreen />} />
              <Route path="/mode" element={<GameModeScreen />} />
              <Route path="/game" element={<GameScreen />} />
            </Routes>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;