import { create } from "zustand";
import { applyThemeToHtml, getThemeById, loadSavedTheme, saveThemeToStorage } from "../utils/themeUtils";

const baseThemes = {
    "classic-light": {
        id: "classic-light",
        label: "Classic Light",
        winLine: "#16a34a",
        confetti: ["#60A5FA", "#F87171", "#34D399", "#FBBF24", "#A855F7"],
        background: "from-gray-100 to-gray-300",
        xColor: "#2563eb",
        oColor: "#dc2626",
        boardColor: "#f0f0f0",
        borderColor: "#d1d5db",
        textColor: "#111827",
        subTextColor: "#4b5563",
        headingColor: "#1f2937",
        buttonText: "#ffffff",
        buttonBg: "#17f237",
        backgroundColor: "#f3f4f6",
    },
    "classic-dark": {
        id: "classic-dark",
        label: "Classic Dark",
        winLine: "#86efac",
        confetti: ["#60a5fa", "#a78bfa", "#fca5a5", "#fde68a", "#f472b6"],
        background: "from-gray-900 to-gray-800",
        xColor: "#60a5fa",
        oColor: "#f87171",
        boardColor: "#1f2937",
        borderColor: "#374151",
        textColor: "#e5e7eb",
        subTextColor: "#9ca3af",
        headingColor: "#ffffff",
        buttonText: "#ffffff",
        buttonBg: "#374151",
        backgroundColor: "#111827",
    },
    pastel: {
        id: "pastel",
        label: "Pastel Soft",
        winLine: "#f472b6",
        confetti: ["#fbcfe8", "#c7b3ff", "#bbf7d0", "#fde68a", "#a5f3fc"],
        background: "from-pink-50 to-blue-50",
        xColor: "#60a5fa",
        oColor: "#fbbf24",
        boardColor: "#ffffff",
        borderColor: "#d1d5db",
        textColor: "#374151",
        subTextColor: "#6b7280",
        headingColor: "#1e40af",
        buttonText: "#ffffff",
        buttonBg: "#3b82f6",
        backgroundColor: "#fdf2f8"
    },
    neon: {
        id: "neon",
        label: "Neon Glow",
        winLine: "#67e8f9",
        confetti: ["#34d399", "#f472b6", "#60a5fa", "#facc15", "#ff4d6d"],
        background: "from-black to-slate-900",
        xColor: "#0ea5e9",
        oColor: "#f472b6",
        boardColor: "#111827",
        borderColor: "#1e293b",
        textColor: "#e0f2fe",
        subTextColor: "#94a3b8",
        headingColor: "#38bdf8",
        buttonText: "#ffffff",
        buttonBg: "#0ea5e9",
        backgroundColor: "#000000"
    },
    retro: {
        id: "retro",
        label: "Retro Pixel",
        winLine: "#fbbf24",
        confetti: ["#fde68a", "#fb923c", "#f472b6", "#34d399", "#60a5fa"],
        background: "from-yellow-50 to-orange-50",
        xColor: "#f97316",
        oColor: "#8b5cf6",
        boardColor: "#fef9c3",
        borderColor: "#fcd34d",
        textColor: "#7c2d12",
        subTextColor: "#b45309",
        headingColor: "#ea580c",
        buttonText: "#ffffff",
        buttonBg: "#f97316",
        backgroundColor: "#fef3c7"
    },
    "deep-space": {
        id: "deep-space",
        label: "Deep Space",
        winLine: "#fde047",
        confetti: ["#fbbf24", "#f472b6", "#60a5fa", "#a78bfa", "#f5f3ff"],
        background: "from-gray-950 to-gray-900",
        xColor: "#fbbf24",
        oColor: "#60a5fa",
        boardColor: "#0f172a",
        borderColor: "#1e293b",
        textColor: "#e2e8f0",
        subTextColor: "#94a3b8",
        headingColor: "#fbbf24",
        buttonText: "#ffffff",
        buttonBg: "#6366f1",
        backgroundColor: "#030712"
    },
};


// Read from local storage about the saved theme else default theme is classic light
const savedTheme = loadSavedTheme();
const initialTheme = getThemeById(savedTheme, baseThemes);
applyThemeToHtml(initialTheme);

export const useThemeStore = create((set) => ({
    currentTheme: savedTheme,
    themeConfig: baseThemes,
    setTheme: (id) => {
        saveThemeToStorage(id);
        const theme = getThemeById(id, baseThemes);
        applyThemeToHtml(theme)
        set({ currentTheme: id });
    },
}));

