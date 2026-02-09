import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/useGameStore";
import { useThemeStore } from "../store/useThemeStore";
import { getThemeById } from "../utils/themeUtils";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const GameModeScreen = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState(null);
    const [aiDifficulty, setAiDifficulty] = useState("Easy");
    const [localP1, setLocalP1] = useState("");
    const [localP2, setLocalP2] = useState("");

    const { resetGame, setGameMode, setPlayer1, setPlayer2, boardSize, setBoardSize, board, winner, gameStarted } = useGameStore();
    const { currentTheme, themeConfig } = useThemeStore();
    const theme = getThemeById(currentTheme, themeConfig);

    const gameActive = gameStarted && board.some(cell => cell !== null) && !winner;

    const flickerColors = theme.confetti && theme.confetti.length > 0
        ? theme.confetti
        : (theme.xColor || "#94a3b8");

    useEffect(() => {
        setLocalP1("");
        setLocalP2("");
    }, [mode]);

    const handleStartClick = () => {
        resetGame();
        const p1Name = localP1.trim() || (mode === "ai" ? "Player" : "Player 1");
        const p2Name = mode === "ai" ? "Computer 🤖" : (localP2.trim() || "Player 2");

        setPlayer1(p1Name);
        setPlayer2(p2Name);
        navigate("/game");
    };

    const renderPlayerInput = (label, value, setValue, placeholder = "Enter name") => (
        <div className="w-full">
            <label
                htmlFor={`input-${label.replace(/\s+/g, '-').toLowerCase()}`}
                className="text-sm font-semibold mb-1 block"
                style={{ color: theme.subTextColor }}
            >
                {label}
            </label>

            <input
                id={`input-${label.replace(/\s+/g, '-').toLowerCase()}`}
                aria-label={label}
                className="w-full p-3 rounded-lg border"
                style={{
                    background: theme.boardColor,
                    borderColor: theme.borderColor,
                    color: theme.textColor,
                }}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                maxLength={20}
            />
        </div>
    );


    // board size [3x3 to 10x10]
    const sizes = [3, 4, 5, 6, 7, 8, 9, 10];

    const handleResumeClick = () => {
        navigate("/game");
    };


    const renderBoardSizeSelector = () => {

        return (
            <div className="w-full">
                <label
                    className="text-sm font-semibold mb-2 block"
                    style={{ color: theme.subTextColor }}
                    id="board-size-label"
                >
                    Select Board Size
                </label>

                <div
                    className="grid grid-cols-4 gap-2"
                    role="group"
                    aria-labelledby="board-size-label"
                >
                    {sizes.map((size) => (
                        <button
                            key={size}
                            onClick={() => {
                                if (!gameActive) {
                                    setBoardSize(size);
                                    resetGame();
                                }
                            }}
                            disabled={gameActive}
                            aria-label={`${size} by ${size} board`}
                            aria-pressed={boardSize === size}
                            className={`py-2 rounded-md font-semibold transition ${gameActive ? "opacity-50 cursor-not-allowed" : ""}`}
                            style={{
                                backgroundColor: boardSize === size ? theme.buttonBg : theme.boardColor,
                                color: boardSize === size ? theme.buttonText : theme.textColor,
                            }}
                        >
                            {size} × {size}
                        </button>
                    ))}
                </div>
                {gameActive && (
                    <div className="flex flex-col items-center mt-2">
                        <p className="text-xs mb-2" style={{ color: theme.subTextColor }}>
                            Finish the current game to change the board size.
                        </p>
                        <button
                            onClick={handleResumeClick}
                            className="px-4 py-2 rounded-lg font-semibold shadow-md hover:scale-105 transition"
                            style={{ background: theme.buttonBg, color: theme.buttonText }}
                        >
                            Resume Game ▶️
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const renderActionButtons = () => {
        return (
            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={handleStartClick}
                    className="px-6 py-3 text-lg font-semibold rounded-lg transition shadow-md hover:scale-105"
                    style={{ background: theme.xColor, color: theme.buttonText }}
                >
                    Start Game ▶️
                </button>

                <button
                    onClick={() => setMode(null)}
                    className="px-6 py-3 rounded-lg"
                    style={{ background: theme.boardColor, color: theme.subTextColor, border: `1px solid ${theme.borderColor}` }}
                >
                    Change Mode
                </button>
            </div>
        );
    };

    return (
        <div className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
            {/* 1. BACKGROUND */}
            <div className="absolute inset-0 z-0">
                <FlickeringGrid
                    squareSize={8}
                    gridGap={6}
                    flickerChance={0.3}
                    color={flickerColors}
                    maxOpacity={0.5}
                    className="w-full h-full"
                />
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: `radial-gradient(circle at center, transparent 20%, ${theme.backgroundColor || theme.boardColor} 100%)`
                    }}
                />
            </div>

            {/* 2. UI CONTENT */}
            <div className="relative z-10 w-full max-w-lg px-6 flex flex-col items-center">
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-8 text-center"
                    style={{ color: theme.headingColor }}>
                    {mode ? "Configure" : "Select Mode"}
                </h2>

                <div className="w-full backdrop-blur-2xl rounded-[3rem] p-8 border shadow-2xl space-y-6"
                    style={{
                        backgroundColor: `${theme.boardColor}aa`,
                        borderColor: `${theme.borderColor}44`
                    }}>

                    {!mode && (
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => setMode("pvp")}
                                className="w-full px-6 py-5 rounded-2xl font-bold text-xl transition transform hover:scale-[1.02] active:scale-95 shadow-xl"
                                style={{ background: theme.xColor, color: "#fff" }}
                            >
                                Local PVP
                            </button>
                            <button
                                onClick={() => setMode("ai")}
                                className="w-full px-6 py-5 rounded-2xl font-bold text-xl transition transform hover:scale-[1.02] active:scale-95 shadow-xl"
                                style={{ background: theme.oColor, color: "#fff" }}
                            >
                                Neural AI 🤖
                            </button>
                        </div>
                    )}

                    {mode === "pvp" && (
                        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                            {renderPlayerInput("Player 1", localP1, setLocalP1)}
                            {renderPlayerInput("Player 2", localP2, setLocalP2)}
                            {renderBoardSizeSelector()}
                            {renderActionButtons()}
                        </div>
                    )}

                    {mode === "ai" && (
                        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                            {renderPlayerInput("Your Name", localP1, setLocalP1)}

                            {/* --- SHADCN SELECT INTEGRATION --- */}
                            <div className="w-full">
                                <label className="text-sm font-semibold mb-1 block opacity-70" style={{ color: theme.subTextColor }}>
                                    Difficulty Level
                                </label>
                                <Select value={aiDifficulty} onValueChange={setAiDifficulty}>
                                    <SelectTrigger
                                        className="w-full h-12 text-lg font-bold rounded-lg border-2"
                                        style={{
                                            background: theme.boardColor,
                                            borderColor: theme.borderColor,
                                            color: theme.textColor
                                        }}
                                    >
                                        <SelectValue placeholder="Select Difficulty" />
                                    </SelectTrigger>
                                    <SelectContent
                                        style={{
                                            background: theme.boardColor,
                                            borderColor: theme.borderColor,
                                            color: theme.textColor
                                        }}
                                    >
                                        <SelectItem value="Easy" className="font-bold cursor-pointer">Easy</SelectItem>
                                        <SelectItem value="Normal" className="font-bold cursor-pointer">Normal</SelectItem>
                                        <SelectItem value="Hard" className="font-bold cursor-pointer">Hard</SelectItem>
                                        <SelectItem value="Expert" className="font-bold cursor-pointer text-red-500">Expert</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {renderBoardSizeSelector()}
                            {renderActionButtons()}
                        </div>
                    )}
                </div>

                <button
                    onClick={() => navigate("/")}
                    className="mt-8 px-6 py-2 rounded-full border text-[10px] font-bold uppercase tracking-[0.3em] transition hover:bg-white/10"
                    style={{ borderColor: `${theme.textColor}22`, color: theme.textColor }}
                >
                    ← Return to Base
                </button>
            </div>
        </div>
    );
};

export default GameModeScreen;
