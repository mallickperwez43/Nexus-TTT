const calculateWinner = (squares, n = 3) => {
    const lines = [];

    // 1. Rows
    for (let i = 0; i < n; i++) {
        const row = [];
        for (let j = 0; j < n; j++) row.push(i * n + j);
        lines.push(row);
    }

    // 2. Columns
    for (let i = 0; i < n; i++) {
        const col = [];
        for (let j = 0; j < n; j++) col.push(i + j * n);
        lines.push(col);
    }

    // 3. Diagonals
    const diag1 = [];
    const diag2 = [];
    for (let i = 0; i < n; i++) {
        diag1.push(i * (n + 1));
        diag2.push((i + 1) * (n - 1));
    }
    lines.push(diag1, diag2);

    // Check all lines
    for (let line of lines) {
        const first = squares[line[0]];
        if (first && line.every(index => squares[index] === first)) {
            return { winner: first, winningCells: line };
        }
    }

    // Check for Draw
    if (squares.every(square => square !== null)) {
        return { winner: "Draw", winningCells: null };
    }

    return { winner: null, winningCells: null };
};

module.exports = { calculateWinner };