// src/utils/themeUtils.js

/**
 * Applies all theme properties as CSS variables to the document root
 * @param {Object} theme - Theme object from useThemeStore
 */
export const applyThemeToHtml = (theme) => {
    if (!theme || typeof theme !== 'object') {
        console.warn('Invalid theme provided to applyThemeToHtml');
        return;
    }

    const root = document.documentElement;
    const isDark = theme.id.includes('dark') || theme.id === 'neon' || theme.id === 'deep-space';

    // Set ALL theme properties as CSS variables
    root.style.setProperty("--text-color", theme.textColor);
    root.style.setProperty("--heading-color", theme.headingColor);
    root.style.setProperty("--button-bg", theme.buttonBg);
    root.style.setProperty("--win-line-color", theme.winLine);
    root.style.setProperty("--win-line-grad2", theme.winLine + "55");
    root.style.setProperty("--win-line-glow", theme.winLine + "66");
    root.style.setProperty("--subtext-color", theme.subTextColor);
    root.style.setProperty("--button-text", theme.buttonText);
    root.style.setProperty("--x-color", theme.xColor);
    root.style.setProperty("--o-color", theme.oColor);
    root.style.setProperty("--board-color", theme.boardColor);
    root.style.setProperty("--border-color", theme.borderColor);
    root.style.setProperty("--bg-color", isDark ? "#020617" : "#f8fafc");
    root.style.setProperty("--grid-line-color", isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)");

    // Also set the background class if needed
    if (theme.background) {
        // You can add this if you want to use it elsewhere
        root.style.setProperty("--theme-background", theme.background);
    }
};

/**
 * Gets theme by ID with fallback
 * @param {string} themeId - Theme identifier
 * @param {Object} themeConfig - All themes
 * @returns {Object} Theme object
 */
export const getThemeById = (themeId, themeConfig) => {
    return themeConfig[themeId] || themeConfig["classic-light"] || {};
};

/**
 * Loads saved theme from localStorage
 * @returns {string} Theme ID
 */
export const loadSavedTheme = () => {
    return localStorage.getItem("tic-tac-toe-theme") || "classic-light";
};

/**
 * Saves theme to localStorage
 * @param {string} themeId - Theme identifier
 */
export const saveThemeToStorage = (themeId) => {
    localStorage.setItem("tic-tac-toe-theme", themeId);
};