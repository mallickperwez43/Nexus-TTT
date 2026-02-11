import React, { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useGameStore } from "../store/useGameStore";
import { useThemeStore } from "../store/useThemeStore";
import Cell from "../components/Cell";
import confetti from "canvas-confetti";
import { getThemeById } from "../utils/themeUtils";
import { useKeyboardShortCuts } from "../hooks/useKeyboardShortcuts";
import HelpModal from "../components/HelpModal";
import { NeonGradientCard } from "@/components/ui/neon-gradient-card";
import { socket } from "@/lib/socket";
import { useAuthStore } from "@/store/useAuthStore";
import ChatBox from "@/components/ChatBox";

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
        roomCode,
        syncGameState
    } = useGameStore();

    const { themeConfig, currentTheme } = useThemeStore();
    const theme = getThemeById(currentTheme, themeConfig);

    const { user } = useAuthStore();

    const boardRef = useRef(null);
    const confettiFrameRef = useRef(null);

    // track measured board size (square)
    const [measuredBoardSize, setMeasuredBoardSize] = useState(0);
    // used to force recreation of gradient/filter elements so they update reliably
    const [winKey, setWinKey] = useState(0);

    const [opponentJoined, setOpponentJoined] = useState(false);

    const navigate = useNavigate();

    const gameActive = gameStarted && board.some(cell => cell !== null) && !winner;

    useEffect(() => {
        if (gameMode !== "online") {
            setOpponentJoined(true);
            return;
        }

        // 1. Join the room
        socket.emit("join_room", {
            room: roomCode,
            username: user?.username || "Guest",
            gridSize: n,
        });

        // 2. Listen for player count changes
        socket.on("room_status", (data) => {
            // 1. Update joined state
            const hasOpponent = data.count >= 2 || (data.players && data.players.length >= 2);;
            setOpponentJoined(hasOpponent);

            // 2. Update players in store
            if (data.players) {
                useGameStore.getState().updateOnlinePlayers(data.players);
            }

            // 3. Logic: If opponent leaves MID-GAME (not in lobby)
            // We only care if the game actually started (moves on board)
            const isMidGame = useGameStore.getState().board.some(cell => cell !== null);

            if (data.count < 2 && isMidGame && !winner) {
                console.log("Opponent disconnected during active play.");
                // The 'opponent_left_win' event from server will handle the modal
            }

            if (data.gridSize && data.gridSize !== n) {
                useGameStore.getState().setBoardSize(data.gridSize);
            }
        });

        // 3. Listen for the Authoritative Server State

        // Forfeit win
        socket.on("opponent_left_win", (data) => {
            // We use the store to set the winner manually
            const state = useGameStore.getState();

            // Determine if the remaining player is X or O to set the winner correctly
            // If the store doesn't have a specific setWinner, we can trigger it via sync
            state.syncGameState({
                board: state.board,
                winner: state.playerRole, // The person still here is the winner
                winningCells: [], // No line needed for forfeit
                currentPlayer: state.currentPlayer
            });

            // Optional: Show a toast or specific message
            console.log(data.message);
        });

        // This handles moves, undos, redos, and resets globally
        socket.on("sync_state", (data) => {
            syncGameState(data);
        });

        return () => {
            socket.off("room_status");
            socket.off("sync_state");
            socket.off("opponent_left_win");
        };
    }, [gameMode, roomCode, user]);

    useEffect(() => {
        if (board.every(cell => cell === null)) {
            stopConfetti();
            setWinKey(k => k + 1);
        }
    }, [board]);

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
        navigate,
    });


    // measure board using ResizeObserver for reliable updates (SVG LINE)
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

    // run confetti + force winKey increment on new winner
    useEffect(() => {
        if (winner) {
            setWinKey((k) => k + 1);
            runConfettiForResult(winner);

            // Record win for online multiplayer
            if (gameMode === "online" && winner !== "Draw") {
                const playerRole = useGameStore.getState().playerRole;

                console.log("🎮 Game ended. Winner:", winner, "| Your role:", playerRole, "| Username:", user?.username);

                // Only the winner records their win
                if (winner === playerRole) {
                    console.log("🏆 You won! Recording win for:", user?.username);
                    socket.emit("record_win", { username: user?.username });
                } else {
                    console.log("😢 You lost. Winner was:", winner);
                }
            }
        }
        return () => {
            stopConfetti();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [winner, theme, gameMode, user]);


    // Setup neon colors based on theme confetti
    const neonColors = {
        firstColor: theme.confetti?.[0] || "#ffffff",
        secondColor: theme.confetti?.[1] || theme.confetti?.[0] || "#ffffff",
    };

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

    const runConfettiForResult = (result) => {
        stopConfetti();

        const colors = theme.confetti?.length ? theme.confetti : ["#fff"];
        const isDraw = result === "Draw";

        if (isDraw) {
            // DRAW: Minimal "Snow" effect from the top
            const end = Date.now() + 2000;
            const frame = () => {
                confetti({
                    particleCount: 1,
                    startVelocity: 0,
                    ticks: 120,
                    origin: { x: Math.random(), y: Math.random() - 0.2 },
                    colors: [colors[Math.floor(Math.random() * colors.length)]],
                    gravity: 0.3,
                    scalar: 0.5,
                    drift: Math.sin(Date.now() / 1000) * 0.2,
                });
                if (Date.now() < end) confettiFrameRef.current = requestAnimationFrame(frame);
            };
            frame();
        } else {
            // WIN: Shake + Cell Burst + Side Cannons
            shakeBoard();

            // 1. Initial burst from the actual winning tiles
            if (winningCells) {
                winningCells.forEach((cellIdx) => {
                    const pos = coordForIndex(cellIdx);
                    confetti({
                        particleCount: 8,
                        spread: 30,
                        startVelocity: 20,
                        origin: { x: pos.x / measuredBoardSize, y: pos.y / measuredBoardSize },
                        colors
                    });
                });
            }

            // 2. Continuous Side Cannons for celebration
            const end = Date.now() + 1800;
            const frame = () => {
                confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors });
                confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors });

                if (Date.now() < end) {
                    confettiFrameRef.current = requestAnimationFrame(frame);
                }
            };
            frame();
        }
    };

    const mapPlayerToName = (symbol) =>
        symbol === "X" ? player1 || "Player 1" : player2 || (gameMode === "ai" ? "AI 🤖" : "Player 2");

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

    const handleExit = () => {
        if (gameMode === "online" && roomCode) {
            socket.emit("leave_room", { room: roomCode });
            socket.disconnect(); // Cleanly close the connection
        }
        resetGame();
        navigate("/mode");
    };

    if (!gameMode) {
        return <Navigate to="/" replace />
    }

    return (
        <div
            className="min-h-dvh w-full flex flex-col items-center transition-all duration-500 overflow-hidden"
            style={{ backgroundColor: theme.backgroundColor || theme.boardColor, color: theme.textColor }}
        >
            <HelpModal
                isOpen={showHelp}
                onClose={() => setShowHelp(false)}
            />

            <header className="w-full max-w-lg px-6 pt-8 flex flex-col items-center">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none mb-6" style={{ color: theme.headingColor }}>
                    Neural Tic Tac Toe
                </h1>

                {/* VS Info */}
                <div className="flex items-center justify-between w-full bg-black/5 p-2 rounded-2xl border-2"
                    style={{ borderColor: theme.borderColor }}>

                    {/* Player 1 (X) */}
                    <div className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all duration-300 
                        ${currentPlayer === 'X' ? 'bg-white/10 shadow-lg scale-105' : 'opacity-40'}`}>
                        <span className="text-[10px] font-black uppercase opacity-60">
                            {gameMode === "online" && useGameStore.getState().playerRole === "X" ? "YOU (X)" : "Player 1"}
                        </span>
                        <span className="text-xl font-black" style={{ color: theme.xColor }}>{player1 || "X"}</span>
                    </div>

                    <div className="px-4 font-black italic opacity-20 text-2xl">VS</div>

                    {/* Player 2 (O) */}
                    <div className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all duration-300 
                        ${currentPlayer === 'O' ? 'bg-white/10 shadow-lg scale-105' : 'opacity-40'}`}>
                        <span className="text-[10px] font-black uppercase opacity-60">
                            {gameMode === 'ai' ? 'AI' : (gameMode === "online" && useGameStore.getState().playerRole === "O" ? "YOU (O)" : "Player 2")}
                        </span>
                        <span className="text-xl font-black" style={{ color: theme.oColor }}>
                            {gameMode === 'ai' ? "🤖" : (player2 || "O")}
                        </span>
                    </div>
                </div>
            </header>

            {/* Status Area */}
            <div className="h-12 flex items-center justify-center mt-2">
                <p className="font-bold uppercase tracking-widest text-xs sm:text-sm italic opacity-80">
                    {thinking ? (
                        "🤖 AI is calculating..."
                    ) : winner ? (
                        "Round Over"
                    ) : gameMode === "online" ? (
                        // Logic for Online Turn Display
                        currentPlayer === useGameStore.getState().playerRole ? (
                            <span style={{ color: theme.winLine }}>Your Turn</span>
                        ) : (
                            `Waiting for ${currentPlayer === "X" ? (player1 || "Opponent") : (player2 || "Opponent")}...`
                        )
                    ) : (
                        // Logic for Local/AI Turn Display
                        `Turn: ${mapPlayerToName(currentPlayer)}`
                    )}
                </p>
            </div>

            <main className="flex-1 flex items-center justify-center w-full px-4">
                <div
                    ref={boardRef}
                    className="w-[min(92vw,520px)] aspect-square relative"
                >
                    <NeonGradientCard
                        borderSize={3}
                        borderRadius={24}
                        neonColors={neonColors}
                    >

                        {/* MULTIPLAYER OVERLAY */}
                        {!opponentJoined && gameMode === "online" && !winner && (
                            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-lg rounded-2xl p-6 text-center">
                                <div className="relative mb-6">
                                    <div className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin"
                                        style={{ borderColor: `${theme.xColor}44`, borderTopColor: theme.xColor }}></div>
                                    <div className="absolute inset-0 flex items-center justify-center font-black text-xs uppercase"
                                        style={{ color: theme.xColor }}>TTT</div>
                                </div>

                                <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2" style={{ color: theme.headingColor }}>
                                    Syncing Node...
                                </h3>
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-50 mb-4">
                                    Room: <span style={{ color: theme.xColor }}>{roomCode}</span>
                                </p>
                                <p className="text-xs font-medium max-w-[200px] leading-relaxed opacity-70">
                                    Waiting for an opponent to establish connection.
                                </p>
                            </div>
                        )}

                        <div
                            className="game-board grid gap-1.5 p-1.5 w-full h-full rounded-2xl shadow-2xl"
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
                    </NeonGradientCard>

                    {/* win line overlay */}
                    {renderWinLine()}
                </div>
            </main>

            {/* Controls Footer */}
            <footer className="w-full max-w-md px-6 py-8 flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-2">
                    <button onClick={undoMove}
                        className="py-3 rounded-xl font-black uppercase text-xs transition-all active:scale-90 disabled:opacity-20 shadow-md"
                        style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}>Undo</button>
                    <button onClick={redoMove}
                        className="py-3 rounded-xl font-black uppercase text-xs transition-all active:scale-90 disabled:opacity-20 shadow-md"
                        style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}>Redo</button>
                    <button onClick={() => { stopConfetti(); resetGame(); }}
                        className="py-3 rounded-xl font-black uppercase text-xs transition-all active:scale-90 shadow-lg"
                        style={{ backgroundColor: theme.winLine, color: theme.buttonText }}>Reset</button>
                </div>

                <div className="flex justify-between items-center px-2">
                    <button onClick={() => setShowHelp(true)} className="text-[10px] font-black uppercase opacity-50 tracking-widest">⌨️ Help</button>
                    <button onClick={handleExit} className="text-[10px] font-black uppercase opacity-50 tracking-widest">← Exit Game</button>
                </div>

                {gameMode === "online" && (
                    <div className="w-full max-w-md mt-6">
                        <ChatBox room={roomCode} isGlobal={false} theme={theme} username={user?.username} />
                    </div>
                )}
            </footer >

            {/* Winner Modal */}
            {
                winner && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-100 p-6"
                        onClick={(e) => e.target === e.currentTarget && resetGame()}>
                        <div className="w-full max-w-sm p-8 rounded-[2rem] shadow-2xl text-center border-4 animate-in zoom-in duration-300"
                            style={{ backgroundColor: theme.boardColor, borderColor: theme.borderColor, color: theme.textColor }}>
                            <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-2" style={{ color: theme.headingColor }}>
                                {winner === "Draw" ? "Draw" : "Winner!"}
                            </h2>
                            <p className="text-xl font-bold mb-8 opacity-70">
                                {winner !== "Draw" && board.filter(Boolean).length < (n * n) && !winningCells?.length
                                    ? "Opponent Forfeited!"
                                    : (winner === "Draw" ? "Nice try!" : `${mapPlayerToName(winner)} takes it.`)}
                            </p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { stopConfetti(); resetGame(); }}
                                    className="w-full py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-transform"
                                    style={{ backgroundColor: theme.winLine, color: theme.buttonText }}>
                                    Play Again
                                </button>
                                <button onClick={() => navigate("/mode")} className="w-full py-2 text-xs font-black uppercase opacity-40">Main Menu</button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default GameScreen;