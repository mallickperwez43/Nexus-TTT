import React from "react";
import { useNavigate } from "react-router-dom";
import { useThemeStore } from "../store/useThemeStore";
import { useGameStore } from "../store/useGameStore";
import { Boxes } from "../components/ui/background-boxes";

const HomeScreen = () => {
    const navigate = useNavigate();
    const { board, winner, gameStarted } = useGameStore();
    const { currentTheme, themeConfig } = useThemeStore();
    const theme = themeConfig[currentTheme];

    const canResume = gameStarted && board.some(cell => cell !== null) && !winner;

    return (
        <div className="relative h-full w-full flex flex-col items-center justify-center transition-colors duration-500 overflow-hidden">
            {/* 1. The Interactive Grid - Moved to fixed to ensure it fills the viewport */}
            <div className="fixed inset-0 w-full h-full overflow-hidden"
                style={{ zIndex: 0 }}
            >
                <Boxes themeColors={theme.confetti} />
            </div>

            {/* 2. Gradient Overlay for Depth - Matches theme background */}
            <div className="fixed inset-0 w-full h-full z-0 pointer-events-none"
                style={{
                    background: `radial-gradient(circle at center, transparent 10%, var(--bg-color) 95%)`,
                    zIndex: 1
                }}
            />

            {/* 3. The UI Content */}
            <div className="relative z-10 flex flex-col items-center gap-12 text-center px-6 py-12"
                style={{ zIndex: 2 }}
            >

                <div className="space-y-4">
                    <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase leading-none"
                        style={{
                            color: theme.headingColor,
                            filter: `drop-shadow(0 0 30px ${theme.headingColor}66)`
                        }}>
                        Nexus
                    </h1>
                    <p className="text-lg md:text-xl font-bold tracking-[0.5em] uppercase opacity-50"
                        style={{ color: theme.textColor }}>
                        Tic-Tac-Toe
                    </p>
                </div>

                <div className="flex flex-col gap-4 w-64 md:w-80">
                    <button
                        onClick={() => navigate("/mode")}
                        className="group relative px-8 py-5 rounded-2xl font-bold text-xl transition-all active:scale-95 overflow-hidden shadow-2xl"
                        style={{ backgroundColor: theme.headingColor, color: theme.id.includes('light') ? '#fff' : '#000' }}
                    >
                        <span className="relative z-10">Local Play</span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </button>

                    <button
                        onClick={() => navigate("/lobby")}
                        className="px-8 py-5 rounded-2xl font-bold text-xl border-2 transition-all hover:bg-white/5 active:scale-95 backdrop-blur-sm"
                        style={{ borderColor: `${theme.textColor}33`, color: theme.textColor }}
                    >
                        Multiplayer 🌐
                    </button>

                    {canResume && (
                        <button
                            onClick={() => navigate("/game")}
                            className="mt-2 text-xs font-black uppercase tracking-[0.2em] animate-pulse py-2 px-4 rounded-full border border-dashed"
                            style={{ color: theme.xColor, borderColor: `${theme.xColor}44` }}
                        >
                            • Resume Active Mission
                        </button>
                    )}
                </div>

                <button
                    onClick={() => navigate("/themes")}
                    className="mt-4 px-6 py-2 rounded-full border transition-all text-[10px] font-bold uppercase tracking-[0.3em] backdrop-blur-md"
                    style={{
                        borderColor: `${theme.textColor}22`,
                        color: theme.textColor,
                        backgroundColor: `${theme.textColor}08`
                    }}
                >
                    THEME: {theme.label}
                </button>
            </div>
        </div>
    );
};

export default HomeScreen;