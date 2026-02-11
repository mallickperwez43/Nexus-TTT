import { create } from "zustand";
import { persist } from "zustand/middleware";
import { calculateWinner } from "../utils/gameHelpers"
import { makeAIMoveEasy, makeAIMoveHeuristic, makeAIMoveExpert } from "../utils/aiLogic";
import { socket } from "../lib/socket";

export const useGameStore = create(
    persist(
        (set, get) => ({
            // --STATE--
            boardSize: 3,
            board: Array(9).fill(null),
            currentPlayer: "X",
            winner: null,
            winningCells: [],
            history: [],
            future: [],
            gameMode: "pvp",
            difficulty: "Easy",
            lastMove: null,
            thinking: false,
            gameStarted: false,
            player1: "",
            player2: "",

            roomCode: null,
            playerRole: "X",
            isOppoenentReady: false,

            // --SETTERS--
            setPlayer1: (name) => set({ player1: name }),
            setPlayer2: (name) => set({ player2: name }),
            resetNames: () => set({ player1: "Player1", player2: "Player2" }),

            setBoardSize: (n) => set({
                boardSize: n,
                board: Array(n * n).fill(null),
                currentPlayer: "X",
                winner: null,
                history: [],
                future: [],
                lastMove: null,
                gameStarted: false,
            }),

            setGameMode: (mode, difficulty = "Easy") => set({ gameMode: mode, difficulty }),
            setDifficulty: (difficulty) => set({ difficulty }),

            setMultiplayer: (room, role, size = 3) => set({
                gameMode: "online",
                roomCode: room,
                playerRole: role,
                boardSize: size,
                board: Array(size * size).fill(null), // Initialize correct board size
                gameStarted: true,
                winner: null,
                winningCells: [],
                history: [],
                future: []
            }),

            // Update names specifically from the socket room_status event
            updateOnlinePlayers: (players) => {
                // players is an array from the backend: ["Alice", "Bob"]
                set({
                    player1: players[0] || "Waiting...",
                    player2: players[1] || "Waiting..."
                });
            },

            // ---CORE ACTIONS---
            // This is the NEW "Source of Truth" receiver for Online Mode
            syncGameState: (data) => {
                set({
                    board: data.board,
                    currentPlayer: data.currentPlayer,
                    winner: data.winner,
                    winningCells: data.winningCells || [],
                    history: data.history || [],
                    future: data.future || [],
                    lastMove: data.lastMove,
                });
            },

            makeMove: (index) => {
                const { board, currentPlayer, boardSize, winner, gameMode, difficulty, roomCode, playerRole } = get();

                // 1. ONLINE MODE: Talk to Server
                if (gameMode === "online") {
                    if (currentPlayer !== playerRole || winner || board[index]) return;
                    // We don't update local state here! We wait for the server to sync us.
                    socket.emit("send_move", { room: roomCode, index });
                    return;
                }

                // 2. LOCAL/AI MODE: Update immediately
                if (winner || board[index] !== null) return;

                const newBoard = [...board];
                newBoard[index] = currentPlayer;
                const result = calculateWinner(newBoard, boardSize);
                const nextPlayer = currentPlayer === "X" ? "O" : "X";

                set(state => ({
                    board: newBoard,
                    currentPlayer: nextPlayer,
                    winner: result.winner,
                    winningCells: result.winningCells,
                    history: [...state.history, { board: [...board], currentPlayer, lastMove: index }],
                    future: [],
                    lastMove: index,
                    gameStarted: true,
                }));

                // Trigger AI if applicable
                if (gameMode === "ai" && nextPlayer === "O" && !result.winner) {
                    get()._triggerAIMove();
                }
            },

            undoMove: () => {
                const { gameMode, roomCode, history, thinking } = get();

                if (gameMode === "online") {
                    socket.emit("request_undo", { room: roomCode });
                } else {
                    if (thinking || !history.length) return;
                    const undoOnce = () => {
                        const last = get().history.slice(-1)[0];
                        set(state => ({
                            board: last.board,
                            currentPlayer: last.currentPlayer,
                            winner: null,
                            winningCells: [],
                            history: state.history.slice(0, -1),
                            future: [{ board: [...state.board], currentPlayer: state.currentPlayer }, ...state.future],
                        }));
                    };
                    undoOnce();
                    if (gameMode === "ai" && history.length > 1) undoOnce();
                }
            },

            redoMove: () => {
                const { gameMode, roomCode, future, thinking } = get();

                if (gameMode === "online") {
                    socket.emit("request_redo", { room: roomCode });
                } else {
                    if (thinking || !future.length) return;
                    const next = future[0];
                    const result = calculateWinner(next.board, Math.sqrt(next.board.length));
                    set(state => ({
                        board: next.board,
                        currentPlayer: next.currentPlayer,
                        winner: result.winner,
                        winningCells: result.winningCells,
                        history: [...state.history, next],
                        future: state.future.slice(1),
                    }));
                }
            },

            resetGame: () => {
                const { boardSize, gameMode, roomCode } = get();
                if (gameMode === "online") {
                    socket.emit("reset_game", { room: roomCode });
                } else {
                    set({
                        board: Array(boardSize * boardSize).fill(null),
                        currentPlayer: "X",
                        winner: null,
                        winningCells: [],
                        history: [],
                        future: [],
                        gameStarted: false,
                    });
                }
            },

            // Helper for AI Logic
            _triggerAIMove: () => {
                set({ thinking: true });
                setTimeout(() => {
                    const state = get();
                    let aiMoveFn;
                    if (state.difficulty === "Easy") aiMoveFn = () => makeAIMoveEasy(state.board);
                    else if (state.difficulty === "Normal") aiMoveFn = () => makeAIMoveHeuristic(state.board, state.boardSize, "O", "X", 0.35);
                    else if (state.difficulty === "Hard") aiMoveFn = () => makeAIMoveHeuristic(state.board, state.boardSize, "O", "X", 0);
                    else aiMoveFn = () => makeAIMoveExpert(state.board, state.boardSize, "O", "X");

                    const aiMove = aiMoveFn();
                    if (aiMove !== null) get().makeMove(aiMove);
                    set({ thinking: false });
                }, 600);
            }
        }),
        {
            name: "neural-tic-tac-toe-meta",
            partialize: (state) => ({
                boardSize: state.boardSize,
                gameMode: state.gameMode,
                difficulty: state.difficulty,
                player1: state.player1,
                player2: state.player2,
            }),
        }
    )
);
