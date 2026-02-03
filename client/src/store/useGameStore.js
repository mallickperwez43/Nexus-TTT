import { create } from "zustand";
import { persist } from "zustand/middleware";
import { calculateWinner } from "../utils/gameHelpers"
import { makeAIMoveEasy, makeAIMoveHeuristic, makeAIMoveExpert } from "../utils/aiLogic";

export const useGameStore = create(
    persist(
        (set, get) => ({
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

            makeMove: (index) => {
                const { board, currentPlayer, boardSize, winner, gameMode, difficulty } = get();
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

                if (gameMode === "ai" && nextPlayer === "O" && !result.winner) {
                    set({ thinking: true });
                    setTimeout(() => {
                        const state = get();
                        let aiMoveFn;

                        if (difficulty === "Easy") aiMoveFn = () => makeAIMoveEasy(state.board);
                        else if (difficulty === "Normal") aiMoveFn = () => makeAIMoveHeuristic(state.board, state.boardSize, "O", "X", 0.35);
                        else if (difficulty === "Hard") aiMoveFn = () => makeAIMoveHeuristic(state.board, state.boardSize, "O", "X", 0);
                        else if (difficulty === "Expert") aiMoveFn = () => makeAIMoveExpert(state.board, state.boardSize, "O", "X");

                        const aiMove = aiMoveFn();
                        if (aiMove !== null) {
                            const boardAfterAI = [...state.board];
                            boardAfterAI[aiMove] = state.currentPlayer;
                            const aiResult = calculateWinner(boardAfterAI, state.boardSize);
                            const nextTurnPlayer = state.currentPlayer === "X" ? "O" : "X";

                            set(s => ({
                                board: boardAfterAI,
                                currentPlayer: nextTurnPlayer,
                                winner: aiResult.winner,
                                winningCells: aiResult.winningCells,
                                lastMove: aiMove,
                                thinking: false,
                                history: [...s.history, { board: [...s.board], currentPlayer: s.currentPlayer, lastMove: aiMove }],
                            }));
                        } else set({ thinking: false });
                    }, 600);
                }
            },

            undoMove: () => {
                const { history, future, thinking, gameMode } = get();
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
                        lastMove: null,
                    }));
                };

                undoOnce();
                if (gameMode === "ai" && history.length > 1) undoOnce();
            },

            redoMove: () => {
                const { future, thinking } = get();
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
                    lastMove: null,
                }));
            },

            resetGame: () => {
                const { boardSize, gameMode, difficulty } = get();
                set({
                    board: Array(boardSize * boardSize).fill(null),
                    currentPlayer: "X",
                    winner: null,
                    winningCells: [],
                    history: [],
                    future: [],
                    lastMove: null,
                    thinking: false,
                    gameStarted: false,
                    gameMode,
                    difficulty,
                });
            },

            canUndo: () => get().history.length > 0,
            canRedo: () => get().future.length > 0,

            _hydrate: () => {
                const { board, boardSize } = get();
                const result = calculateWinner(board, boardSize);
                set({ winner: result.winner, winningCells: result.winningCells });
            },
        }),
        {
            name: "tic-tac-toe",
            partialize: (state) => ({
                board: state.board,
                currentPlayer: state.currentPlayer,
                history: state.history,
                future: state.future,
                gameMode: state.gameMode,
                difficulty: state.difficulty,
                lastMove: state.lastMove,
                gameStarted: state.gameStarted,
            }),
        }
    )
);
