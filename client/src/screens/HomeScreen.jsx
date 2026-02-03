import React from "react";
import { useNavigate } from "react-router-dom";
import { useThemeStore } from "../store/useThemeStore";
import { useGameStore } from "../store/useGameStore";

const HomeScreen = () => {
    const navigate = useNavigate();
    const { board, winner, gameStarted } = useGameStore();
    const { currentTheme, themeConfig } = useThemeStore();
    const theme = themeConfig[currentTheme];

    const canResume = gameStarted && board.some(cell => cell !== null) && !winner;


    // Helper: determine if color is light (so button text becomes dark)
    const isColorLight = (hex) => {
        if (!hex || hex[0] !== "#") return false;
        const c = hex.substring(1);
        const r = parseInt(c.substr(0, 2), 16);
        const g = parseInt(c.substr(2, 2), 16);
        const b = parseInt(c.substr(4, 2), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 180;
    };

    const autoButtonText = isColorLight(theme.headingColor) ? "#000000" : "#ffffff";

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center gap-6 py-8"
            style={{ color: theme.textColor }}
        >
            <h1
                className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center"
                style={{ color: theme.headingColor }}
            >
                Tic Tac Toe
            </h1>

            <div className="w-full max-w-sm flex flex-col sm:flex-row gap-4">
                <button
                    onClick={() => navigate("/mode")}
                    className="flex-1 px-6 py-3 rounded-lg shadow-md text-lg font-semibold transition transform hover:scale-105"
                    style={{ backgroundColor: theme.headingColor, color: autoButtonText }}
                >
                    Play
                </button>

                {canResume && (
                    <button
                        onClick={() => navigate("/game")}
                        className="px-6 py-3 rounded-lg font-semibold"
                        style={{ backgroundColor: theme.xColor, color: theme.buttonText }}
                    >
                        Resume Game ▶️
                    </button>
                )}

                <button
                    onClick={() => navigate("/themes")}
                    className="flex-1 px-6 py-3 rounded-lg shadow-md text-lg font-semibold transition transform hover:scale-105"
                    style={{ backgroundColor: theme.headingColor, color: autoButtonText }}
                >
                    Themes
                </button>
            </div>

            <p className="mt-3 text-sm text-center" style={{ color: theme.subTextColor }}>
                Active theme: <strong>{currentTheme}</strong>
            </p>
        </div>
    );
};

export default HomeScreen;
