// Core game helpers for Tic Tac Toe

// Cache for winning lines
const linesCache = new Map();

const getLines = (n) => {
    if (linesCache.has(n)) { // return if we already have it
        return linesCache.get(n);
    }

    const lines = [];

    // Rows
    for (let row = 0; row < n; row++) {
        lines.push([...Array(n)].map((_, col) => row * n + col));
    }

    // Columns
    for (let col = 0; col < n; col++) {
        lines.push([...Array(n)].map((_, row) => row * n + col));
    }

    // Diagonals
    lines.push([...Array(n)].map((_, i) => i * n + i));
    lines.push([...Array(n)].map((_, i) => i * n + (n - i - 1)));

    // Store in cache for future use
    linesCache.set(n, lines);

    return lines;
}

// Winner check for NxN board
export const calculateWinner = (board, n) => {
    const lines = getLines(n); // Use Cached Lines

    // Check lines
    for (const line of lines) {
        const first = board[line[0]];
        if (first && line.every(idx => board[idx] === first)) {
            return { winner: first, winningCells: line };
        }
    }

    // Draw
    if (board.every(cell => cell !== null)) return { winner: "Draw", winningCells: [] };

    return { winner: null, winningCells: [] };
};

// Minimax + Alpha-Beta (3x3)
export const minimaxAB = (board, player, aiPlayer, humanPlayer, alpha, beta) => {
    const result = calculateWinner(board, 3);
    if (result.winner === aiPlayer) return { score: 1 };
    if (result.winner === humanPlayer) return { score: -1 };
    if (!board.includes(null)) return { score: 0 };

    let bestMove = { score: player === aiPlayer ? -Infinity : Infinity, index: null };

    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            const newBoard = [...board];
            newBoard[i] = player;

            const nextPlayer = player === aiPlayer ? humanPlayer : aiPlayer;
            const move = minimaxAB(newBoard, nextPlayer, aiPlayer, humanPlayer, alpha, beta);

            if (player === aiPlayer) {
                if (move.score > bestMove.score) bestMove = { score: move.score, index: i };
                alpha = Math.max(alpha, move.score);
            } else {
                if (move.score < bestMove.score) bestMove = { score: move.score, index: i };
                beta = Math.min(beta, move.score);
            }

            if (beta <= alpha) break;
        }
    }

    return bestMove;
};

// Evaluate board for NxN Expert AI
export const evaluateBoard = (board, n, aiPlayer, humanPlayer) => {
    let score = 0;
    const lines = getLines(n);

    for (const line of lines) {
        let ai = 0, human = 0;
        for (const idx of line) {
            if (board[idx] === aiPlayer) ai++;
            if (board[idx] === humanPlayer) human++;
        }
        if (ai > 0 && human === 0) score += Math.pow(10, ai);
        if (human > 0 && ai === 0) score -= Math.pow(10, human);
    }

    return score;
};

// Minimax for NxN with depth limit (Expert AI)
export const minimaxNxN = (board, n, depth, maxDepth, isMax, aiPlayer, humanPlayer, alpha, beta) => {
    const result = calculateWinner(board, n);
    if (result.winner === aiPlayer) return { score: 100000 };
    if (result.winner === humanPlayer) return { score: -100000 };
    if (result.winner === "Draw") return { score: 0 };
    if (depth === maxDepth) return { score: evaluateBoard(board, n, aiPlayer, humanPlayer) };

    const emptyCells = board.map((v, i) => v === null ? i : null).filter(i => i !== null);
    let best = { score: isMax ? -Infinity : Infinity, index: null };

    for (const idx of emptyCells) {
        const newBoard = [...board];
        newBoard[idx] = isMax ? aiPlayer : humanPlayer;

        const move = minimaxNxN(newBoard, n, depth + 1, maxDepth, !isMax, aiPlayer, humanPlayer, alpha, beta);

        if (isMax) {
            if (move.score > best.score) best = { score: move.score, index: idx };
            alpha = Math.max(alpha, move.score);
        } else {
            if (move.score < best.score) best = { score: move.score, index: idx };
            beta = Math.min(beta, move.score);
        }

        if (beta <= alpha) break;
    }

    return best;
};
