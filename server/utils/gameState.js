const { calculateWinner } = require("./gameHelpers");

const syncGameState = async (io, roomCode, redis) => {
    const historyKey = `game:${roomCode}:history`;
    const futureKey = `game:${roomCode}:future`;

    // Fetch the move lists from Redis
    const historyRaw = await redis.lRange(historyKey, 0, -1);
    const futureRaw = await redis.lRange(futureKey, 0, -1);

    const history = historyRaw.map(m => JSON.parse(m));
    const future = futureRaw.map(m => JSON.parse(m));

    // Rebuild the 3x3 board (9 slots)
    const board = Array(9).fill(null);
    history.forEach(move => {
        board[move.index] = move.symbol;
    });

    const result = calculateWinner(board, 3);
    // X always starts, so even length means it's X's turn
    const currentPlayer = history.length % 2 === 0 ? "X" : "O";

    // Broadcast the "Authoritative" state to everyone in the room
    io.to(roomCode).emit("sync_state", {
        board,
        history,
        future,
        currentPlayer,
        winner: result.winner,
        winningCells: result.winningCells,
        lastMove: history.length > 0 ? history[history.length - 1].index : null
    });
};

module.exports = { syncGameState };