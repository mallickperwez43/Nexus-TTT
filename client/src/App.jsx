import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import HomeScreen from "./screens/HomeScreen";
import ThemeScreen from "./screens/ThemeScreen";
import GameModeScreen from "./screens/GameModeScreen";
import GameScreen from "./screens/GameScreen";
import LobbyScreen from "./screens/LobbyScreen";
import { LoaderFive } from "./components/ui/loader";
import { useThemeStore } from "./store/useThemeStore";
import { getThemeById, applyThemeToHtml } from "./utils/themeUtils";
import { useAuthStore } from "./store/useAuthStore";
import ProtectedRoute from "./components/ProtectedRoute";
import SignupScreen from "./screens/SignupScreen";
import LoginScreen from "./screens/LoginScreen";

const loadingStates = [
  "Initializing Nexus Core",
  "Syncing Heuristic AI",
  "Loading Theme Assets",
  "Establishing Neural Link",
  "Verifying Identity",
  "System Online",
];

const App = () => {
  const { currentTheme, themeConfig } = useThemeStore();
  const { checkAuth, isCheckingAuth } = useAuthStore(); // Grab auth state
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);

  // 1. Theme Application
  useEffect(() => {
    const theme = getThemeById(currentTheme, themeConfig);
    applyThemeToHtml(theme);
  }, [currentTheme, themeConfig]);

  // 2. Auth Check + Loading Sequence
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (loading) {
      const stepInterval = setInterval(() => {
        setStep((prev) => {
          if (prev >= loadingStates.length - 1) {
            clearInterval(stepInterval);
            return prev;
          }
          return prev + 1;
        });
      }, 800);

      return () => clearInterval(stepInterval);
    }
  }, [loading]);

  // 3. The "Unlocker" Effect
  // This watches BOTH the animation progress and the auth status
  useEffect(() => {
    const isAnimationDone = step >= loadingStates.length - 1;

    if (!isCheckingAuth && isAnimationDone && loading) {
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isCheckingAuth, step, loading]);

  return (
    <div
      className="min-h-screen w-full relative transition-colors duration-500"
      style={{ backgroundColor: "var(--bg-color)" }}
    >
      {/* 1. Cinematic Loader Overlay */}
      {loading && (
        <div
          className="fixed inset-0 z-100 flex flex-col items-center justify-center p-4 transition-colors duration-500"
          style={{ backgroundColor: "var(--bg-color)" }}
        >
          <div className="flex flex-col items-center justify-center min-h-[200px]">
            <LoaderFive text={loadingStates[step]} />
            <p
              className="mt-8 text-[12px] font-bold uppercase tracking-[0.6em] animate-pulse opacity-70"
              style={{ color: "var(--text-color)" }}
            >
              {isCheckingAuth ? "Authenticating..." : "System Protocol: Active"}
            </p>
          </div>
        </div>
      )}

      {/* 2. Main Game Content */}
      {!loading && (
        <div className="relative z-10 flex flex-col items-center justify-start min-h-screen w-full transition-all duration-1000 animate-in fade-in fill-mode-both">
          <div className="w-full max-w-5xl mx-auto py-8">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomeScreen />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/signup" element={<SignupScreen />} />
              <Route path="/themes" element={<ThemeScreen />} />

              {/* Protected Routes: Only logged in users can access these */}
              <Route element={<ProtectedRoute />}>
                <Route path="/mode" element={<GameModeScreen />} />
                <Route path="/game" element={<GameScreen />} />
                <Route path="/lobby" element={<LobbyScreen />} />
              </Route>
            </Routes>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;