import React, { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useGameStore } from "../store/useGameStore";
import { useThemeStore } from "../store/useThemeStore";
import Cell from "../components/Cell";
import confetti from "canvas-confetti";
import { getThemeById } from "../utils/themeUtils";
import { useKeyboardShortCuts } from "../hooks/useKeyboardShortcuts";
import HelpModal from "../components/HelpModal";

const GameScreen = () => {
    const {
        board,
        currentPlayer,
        winner,
        resetGame,
        undoMove,
        redoMove,
        canUndo,
        canRedo,
        _hydrate,
        thinking,
        gameMode,
        player1,
        player2,
        winningCells,
        boardSize: n,
        gameStarted,
        setBoardSize,
    } = useGameStore();

    const { themeConfig, currentTheme } = useThemeStore();
    const theme = getThemeById(currentTheme, themeConfig);

    const boardRef = useRef(null);
    const confettiFrameRef = useRef(null);

    // track measured board size (square)
    const [measuredBoardSize, setMeasuredBoardSize] = useState(0);
    // used to force recreation of gradient/filter elements so they update reliably
    const [winKey, setWinKey] = useState(0);

    const navigate = useNavigate();

    const gameActive = gameStarted && board.some(cell => cell !== null) && !winner;

    const { showHelp, setShowHelp } = useKeyboardShortCuts({
        undoMove,
        redoMove,
        resetGame: () => {
            stopConfetti();
            setWinKey((k) => k + 1);
            resetGame();
        },
        setBoardSize: (size) => {
            if (!gameActive) {
                setBoardSize(size);
                resetGame();
            }
        },
        canUndo: canUndo(),
        canRedo: canRedo(),
        isThinking: thinking,
        navigate,
    });

    // hydrate store on mount
    useEffect(() => {
        _hydrate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // measure board using ResizeObserver for reliable updates
    useEffect(() => {
        const el = boardRef.current;
        if (!el) {
            // initial attempt: try later
            setTimeout(() => {
                if (boardRef.current) {
                    setMeasuredBoardSize(boardRef.current.getBoundingClientRect().width);
                }
            }, 30);
            return;
        }

        const update = () => {
            const rect = el.getBoundingClientRect();
            const size = Math.min(rect.width, rect.height);
            setMeasuredBoardSize(size);
        };

        // initial
        update();

        // ResizeObserver for responsiveness
        let ro;
        if (window.ResizeObserver) {
            ro = new ResizeObserver(update);
            ro.observe(el);
        } else {
            // fallback
            window.addEventListener("resize", update);
        }

        return () => {
            if (ro) ro.disconnect();
            else window.removeEventListener("resize", update);
        };
    }, []);

    // refresh the winKey when theme changes so SVG defs refresh (fixes missing stroke on theme switch)
    useEffect(() => {
        setWinKey((k) => k + 1);
    }, [currentTheme]);

    // run confetti + force winKey increment on new winner
    useEffect(() => {
        if (winner) {
            setWinKey((k) => k + 1);
            runConfettiForResult(winner);
        }
        return () => {
            stopConfetti();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [winner, theme]);


    if (!gameMode) {
        return <Navigate to="/" replace />
    }

    const shakeBoard = () => {
        if (!boardRef.current) return;
        const boardEl = boardRef.current.querySelector(".game-board");
        if (!boardEl) return;

        boardEl.classList.add("shake-board");
        setTimeout(() => boardEl.classList.remove("shake-board"), 450);
    };


    const stopConfetti = () => {
        if (confettiFrameRef.current) {
            cancelAnimationFrame(confettiFrameRef.current);
            confettiFrameRef.current = null;
        }
    };

    const burstFromWinningCells = () => {
        if (!winningCells) return;

        winningCells.forEach((cellIdx) => {
            const pos = coordForIndex(cellIdx);

            confetti({
                particleCount: 5,
                spread: 25,
                startVelocity: 25,
                scalar: 0.5,
                gravity: 0.4,
                ticks: 60,
                origin: {
                    x: pos.x / measuredBoardSize,
                    y: pos.y / measuredBoardSize
                },
                colors: theme.confetti
            });
        });
    };

    const runConfettiForResult = (result) => {
        stopConfetti();

        const colors = theme.confetti?.length ? theme.confetti : ["#fff"];
        const isDraw = result === "Draw";

        const duration = isDraw ? 700 : 1400;
        const end = Date.now() + duration;

        // DRAW MODE → minimal clean dust
        if (isDraw) {
            const softDraw = () => {
                confetti({
                    particleCount: 5,
                    spread: 20,
                    gravity: 0.25,
                    scalar: 0.35,
                    ticks: 80,
                    origin: { x: 0.5, y: 0.35 },
                    colors,
                });
            };

            softDraw();
            softDraw();
            return;
        }

        // WIN MODE → add shake + burst from winning cells
        shakeBoard();
        burstFromWinningCells();

        const frame = () => {
            if (Date.now() > end) {
                confettiFrameRef.current = null;
                return;
            }

            // core win bursts
            confetti({
                particleCount: 30 + Math.random() * 20,
                spread: 120,
                startVelocity: 60,
                scalar: 0.8,
                gravity: 0.6,
                origin: { x: 0.5, y: 0.3 },
                colors,
            });

            confettiFrameRef.current = requestAnimationFrame(frame);
        };

        frame();
    };

    const mapPlayerToName = (symbol) =>
        symbol === "X" ? player1 || "Player 1" : player2 || (gameMode === "ai" ? "Computer 🤖" : "Player 2");

    const getStatus = () => {
        if (thinking && gameMode === "ai") return "🤖 Computer is thinking...";
        if (winner === "Draw") return "It's a Draw!!";
        if (winner) return `Winner: ${mapPlayerToName(winner)} 🎉`;
        return `Next Player: ${mapPlayerToName(currentPlayer)} (${currentPlayer})`;
    };

    // coordinates using real board size
    const coordForIndex = (i) => {
        const row = Math.floor(i / n);
        const col = i % n;
        const cell = measuredBoardSize / n;
        return {
            x: col * cell + cell / 2,
            y: row * cell + cell / 2,
        };
    };

    // Render responsive win line — returns an SVG sized to the board (absolute over the board)
    const renderWinLine = () => {
        if (!winner || !winningCells || winningCells.length !== n) return null;
        if (!measuredBoardSize) return null;

        // get the first and last index of the winning cell
        const a = coordForIndex(winningCells[0]);
        const c = coordForIndex(winningCells[winningCells.length - 1]);

        // stroke scales relative to cell size for all board sizes
        const cellSize = measuredBoardSize / n;
        const computedStroke = Math.max(2, Math.min(Math.round(cellSize * 0.35), 12)); // 35% of cell size
        const glowStd = Math.round(computedStroke * 0.6);

        // unique ids so defs work after theme change / multiple renders
        const gradId = `winGrad-${currentTheme}-${winKey}`;
        const filtId = `winGlow-${currentTheme}-${winKey}`;

        return (
            <svg
                key={winKey}
                className="absolute inset-0 pointer-events-none z-30"
                width="100%"
                height="100%"
                viewBox={`0 0 ${measuredBoardSize} ${measuredBoardSize}`}
                preserveAspectRatio="none"
                style={{ left: 0, top: 0 }}
            >
                <defs>
                    <linearGradient id={gradId} x1={a.x} y1={a.y} x2={c.x} y2={c.y} gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor={theme.winLine} />
                        <stop offset="60%" stopColor={theme.winLine + "cc"} />
                        <stop offset="100%" stopColor={theme.winLine} />
                    </linearGradient>

                    <filter id={filtId} x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation={glowStd * 0.9} result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* glow (underlay) */}
                <line
                    x1={a.x}
                    y1={a.y}
                    x2={c.x}
                    y2={c.y}
                    stroke={theme.winLine}
                    strokeWidth={computedStroke + 2}
                    strokeLinecap="round"
                    style={{ mixBlendMode: "screen" }}
                    opacity="0.25"
                    filter={`url(#${filtId})`}
                />

                {/* main gradient line */}
                <line
                    x1={a.x}
                    y1={a.y}
                    x2={c.x}
                    y2={c.y}
                    stroke={`url(#${gradId})`}
                    strokeWidth={computedStroke}
                    strokeLinecap="round"
                />
            </svg>
        );
    };


    return (
        <div className="min-h-screen flex flex-col items-center pt-6 px-4" style={{ color: theme.textColor }}>
            <HelpModal
                isOpen={showHelp}
                onClose={() => setShowHelp(false)}
            />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3" style={{ color: theme.headingColor }}>
                Tic Tac Toe
            </h1>

            <h2 className="text-lg sm:text-3xl font-bold mb-4 mt-3" style={{ color: theme.subTextColor }}>
                {player1 || "Player 1"} vs {player2 || (gameMode === "ai" ? "Computer 🤖" : "Player 2")}
            </h2>

            <div className="text-lg sm:text-xl font-medium mb-5 opacity-90 mt-1" style={{ color: theme.subTextColor }}>
                {getStatus()}
            </div>

            <div className="relative w-full flex justify-center mt-2 sm:mt-4">
                <div
                    ref={boardRef}
                    className="w-[min(92vw,520px)] aspect-square relative">
                    <div
                        className="game-board grid gap-1 p-1 w-full h-full rounded-lg shadow-xl"
                        style={{
                            gridTemplateColumns: `repeat(${n}, 1fr)`,
                            gridTemplateRows: `repeat(${n}, 1fr)`,
                            backgroundColor: theme.boardColor,
                            border: `4px solid ${theme.borderColor}`,
                        }}
                    >
                        {board.map((_, i) => (
                            <Cell key={i} index={i} cellSize={measuredBoardSize / n} />
                        ))}
                    </div>

                    {/* win line overlay */}
                    {renderWinLine()}
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full max-w-md">
                <button
                    onClick={undoMove}
                    disabled={!canUndo() || thinking}
                    className="flex-1 px-4 py-2 rounded-md"
                    style={{
                        backgroundColor: theme.buttonBg,
                        color: theme.buttonText,
                        opacity: !canUndo() || thinking ? 0.5 : 1,
                    }}
                >
                    Undo
                </button>

                <button
                    onClick={redoMove}
                    disabled={!canRedo() || thinking}
                    className="flex-1 px-4 py-2 rounded-md"
                    style={{
                        backgroundColor: theme.buttonBg,
                        color: theme.buttonText,
                        opacity: !canRedo() || thinking ? 0.5 : 1,
                    }}
                >
                    Redo
                </button>

                <button
                    onClick={() => {
                        stopConfetti();
                        setWinKey((k) => k + 1); // reset any lingering defs
                        resetGame();
                    }}
                    className="px-4 py-2 rounded-md"
                    style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}
                >
                    New Game
                </button>

                <button
                    onClick={() => setShowHelp(true)}
                    className="px-4 py-2 rounded-md"
                    style={{
                        backgroundColor: theme.buttonBg,
                        color: theme.buttonText,
                        border: `1px solid ${theme.borderColor}`,
                    }}
                    title="Keyboard Shortcuts (Press H or ?)"
                >
                    ⌨️ Help
                </button>
            </div>

            <button
                className="mt-4 px-6 py-2 rounded-md shadow-md hover:opacity-80 transition"
                style={{ backgroundColor: theme.boardColor, color: theme.headingColor }}
                onClick={
                    () => navigate("/mode")
                }
            >
                ← Back to Menu
            </button>

            {/* WINNER MODAL - PLACED AT THE END FOR TOP Z-INDEX */}
            {winner && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black/50 z-100 animate-fade-in"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="winner-modal-title"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            stopConfetti();
                            navigate("/mode")
                        }
                    }}
                >
                    <div
                        className="p-7 rounded-xl shadow-lg text-center backdrop-blur-md border"
                        style={{
                            backgroundColor: theme.boardColor + "dd",
                            color: theme.textColor,
                            border: `2px solid ${theme.borderColor}55`,
                            maxWidth: '90%'
                        }}
                    >
                        <h2
                            id="winner-modal-title"
                            className="text-3xl font-bold mb-4"
                            style={{ color: theme.headingColor }}
                        >
                            {winner === "Draw" ? "🤝 It's a Draw!" : `🏆 ${mapPlayerToName(winner)} Wins!`}
                        </h2>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => { stopConfetti(); resetGame(); }}
                                aria-label="Start a new game"
                                className="px-6 py-2 rounded-lg font-semibold shadow-sm hover:opacity-90 transition"
                                style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}
                            >
                                Play Again
                            </button>
                            <button
                                onClick={() => navigate("/mode")}
                                aria-label="Return to main menu"
                                className="px-6 py-2 rounded-lg font-semibold border border-gray-400"
                                style={{ color: theme.textColor }}
                            >
                                Menu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameScreen;
