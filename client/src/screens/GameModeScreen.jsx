import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/useGameStore";
import { useThemeStore } from "../store/useThemeStore";
import { getThemeById } from "../utils/themeUtils";

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
        <div
            className="min-h-screen flex flex-col justify-start items-center px-4 py-12"
            style={{ color: theme.textColor }}
        >
            <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-6" style={{ color: theme.headingColor }}>
                Select Game Mode
            </h2>

            <div className="w-full max-w-md">
                {/* Mode Selection Buttons */}
                {!mode && (
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => setMode("pvp")}
                            className="w-full px-6 py-3 rounded-xl font-semibold text-lg transition transform hover:scale-105 shadow-md"
                            style={{ background: theme.xColor, color: theme.buttonText }}
                        >
                            Player vs Player
                        </button>

                        <button
                            onClick={() => setMode("ai")}
                            className="w-full px-6 py-3 rounded-xl font-semibold text-lg transition transform hover:scale-105 shadow-md"
                            style={{ background: theme.oColor, color: theme.buttonText }}
                        >
                            Player vs Computer 🤖
                        </button>
                    </div>
                )}

                {/* PVP MODE */}
                {mode === "pvp" && (
                    <div className="flex flex-col items-center w-full space-y-4">
                        {renderPlayerInput("Name of Player 1", localP1, setLocalP1)}
                        {renderPlayerInput("Name of Player 2", localP2, setLocalP2)}

                        {renderBoardSizeSelector()}

                        {renderActionButtons()}
                    </div>
                )}

                {/* AI MODE */}
                {mode === "ai" && (
                    <div className="flex flex-col items-center w-full space-y-4">
                        {renderPlayerInput("Your Name (Player)", localP1, setLocalP1)}

                        <div className="w-full">
                            <label className="text-sm font-semibold mb-1 block" style={{ color: theme.subTextColor }}>
                                Opponent
                            </label>

                            <div className="w-full p-3 rounded-lg border font-bold" style={{ background: theme.boardColor, borderColor: theme.borderColor, color: theme.textColor }}>
                                Computer 🤖
                            </div>
                        </div>

                        <div className="w-full">
                            <label
                                htmlFor="ai-difficulty-select"
                                className="text-sm font-semibold mb-1 block"
                                style={{ color: theme.subTextColor }}
                            >
                                AI Difficulty Level
                            </label>

                            <select
                                id="ai-difficulty-select"
                                aria-label="AI Difficulty Level"
                                value={aiDifficulty}
                                onChange={(e) => setAiDifficulty(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg shadow-sm font-medium"
                                style={{ background: theme.boardColor, borderColor: theme.borderColor, color: theme.textColor }}
                            >
                                <option>Easy</option>
                                <option>Normal</option>
                                <option>Hard</option>
                                <option>Expert</option>
                            </select>
                        </div>

                        {renderBoardSizeSelector()}

                        {renderActionButtons()}
                    </div>
                )}



                {/* Back Button */}
                <button
                    onClick={() => navigate("/")}
                    className="mt-6 px-6 py-3 rounded-lg shadow-md transition hover:scale-105 font-semibold w-full"
                    style={{ background: theme.boardColor, color: theme.textColor, border: `1px solid ${theme.borderColor}` }}
                >
                    ← Back
                </button>
            </div>
        </div>
    );
};

export default GameModeScreen;
