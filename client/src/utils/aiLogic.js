import { calculateWinner, minimaxAB, minimaxNxN } from "./gameHelpers";

// Easy AI
export const makeAIMoveEasy = (board) => {
    const emptyCells = board.map((v, i) => v === null ? i : null).filter(i => i !== null);
    if (!emptyCells.length) return null;
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
};

// Heuristic AI (Normal / Hard)
export const makeAIMoveHeuristic = (board, n, aiPlayer, humanPlayer, mistakeChance = 0) => {
    const emptyCells = board.map((v, i) => v === null ? i : null).filter(i => i !== null);
    if (Math.random() < mistakeChance) return emptyCells[Math.floor(Math.random() * emptyCells.length)];

    for (const idx of emptyCells) {
        const newBoard = [...board]; newBoard[idx] = aiPlayer;
        if (calculateWinner(newBoard, n).winner === aiPlayer) return idx;
    }

    for (const idx of emptyCells) {
        const newBoard = [...board]; newBoard[idx] = humanPlayer;
        if (calculateWinner(newBoard, n).winner === humanPlayer) return idx;
    }

    const center = Math.floor((n * n) / 2);
    if (board[center] === null) return center;

    return emptyCells[0];
};

// Expert AI (NxN)
export const makeAIMoveExpert = (board, n, aiPlayer, humanPlayer) => {
    const depth = n === 3 ? 7 : n === 4 ? 5 : n === 5 ? 4 : n <= 7 ? 3 : 2;
    return n === 3
        ? minimaxAB(board, aiPlayer, aiPlayer, humanPlayer, -Infinity, Infinity).index
        : minimaxNxN(board, n, 0, depth, true, aiPlayer, humanPlayer, -Infinity, Infinity).index;
};
