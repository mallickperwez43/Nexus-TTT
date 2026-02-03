import React from "react";
import { useNavigate } from "react-router-dom";
import { useThemeStore } from "../store/useThemeStore";
import { getThemeById } from "../utils/themeUtils";

const ThemeScreen = () => {
    const { themeConfig, currentTheme, setTheme } = useThemeStore();
    const navigate = useNavigate();

    // Get current theme object for consistency
    const currentThemeObj = getThemeById(currentTheme, themeConfig);

    return (
        <div className="min-h-screen p-4 sm:p-6" style={{ color: currentThemeObj.textColor || "#000" }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold" style={{ color: currentThemeObj.headingColor || "#000" }}>
                    Select Theme
                </h2>

                <button
                    onClick={() => navigate("/")}
                    className="px-3 py-2 rounded"
                    style={{
                        backgroundColor: currentThemeObj.boardColor,
                        color: currentThemeObj.textColor || "#ff4500",
                        border: `1px solid ${currentThemeObj.borderColor}`,
                    }}
                >
                    Back
                </button>
            </div>

            {/* Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {Object.entries(themeConfig).map(([key, t]) => (
                    <div
                        key={key}
                        className="p-4 rounded-lg border transition-all duration-300 hover:scale-105"
                        style={{
                            borderColor: currentTheme === key ? t.winLine : t.borderColor,
                            borderWidth: currentTheme === key ? "3px" : "1px",
                            boxShadow: currentTheme === key ? "0 0 0 6px rgba(99,102,241,0.12)" : "none",
                        }}
                    >
                        {/* Theme preview (square-ish) */}
                        <div
                            className="w-full rounded mb-3 flex items-center justify-center border"
                            style={{
                                backgroundColor: t.boardColor,
                                borderColor: t.borderColor,
                                borderStyle: "solid",
                                minHeight: 96,
                            }}
                        >
                            <span style={{ color: t.xColor }} className="mr-2 text-3xl sm:text-4xl font-bold">X</span>
                            <span style={{ color: t.oColor }} className="text-3xl sm:text-4xl font-bold">O</span>
                        </div>

                        {/* Win line preview as small colored circle */}
                        <div className="flex items-center mb-3 gap-3">
                            <span className="text-sm" style={{ color: t.subTextColor || "#555" }}>Win line:</span>
                            <span className="w-6 h-6 rounded-full border" style={{ backgroundColor: t.winLine, borderColor: t.winLine }} />
                        </div>

                        {/* Confetti preview */}
                        <div className="flex items-center mb-3 gap-2">
                            <span className="text-sm" style={{ color: t.subTextColor || "#555" }}>Confetti:</span>
                            {t.confetti.map((color, idx) => (
                                <span key={idx} className="w-5 h-5 rounded-full border" style={{ backgroundColor: color, borderColor: color }} />
                            ))}
                        </div>

                        {/* Select button */}
                        <div className="flex justify-center gap-2">
                            <button
                                onClick={() => setTheme(key)}
                                className="px-4 py-2 rounded-md w-full"
                                style={{
                                    backgroundColor: t.buttonBg,
                                    color: t.buttonText,
                                    fontWeight: currentTheme === key ? "bold" : "normal",
                                }}
                            >
                                {currentTheme === key ? "Active" : "Select"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ThemeScreen;