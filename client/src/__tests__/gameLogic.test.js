// Test the core game logic - winner detection
import { calculateWinner } from "../utils/gameHelpers";

describe('Tic Tac Toe Game Logic', () => {
    test('should detect X wins horizontally', () => {
        const board = ['X', 'X', 'X', null, null, null, null, null, null];
        const result = calculateWinner(board, 3);
        expect(result.winner).toBe('X');
        expect(result.winningCells).toEqual([0, 1, 2]);
    });

    test('should detect O wins vertically', () => {
        const board = ['O', null, null, 'O', null, null, 'O', null, null];
        const result = calculateWinner(board, 3);
        expect(result.winner).toBe('O');
        expect(result.winningCells).toEqual([0, 3, 6]);
    });

    test('should detect X wins diagonally', () => {
        const board = ['X', null, null, null, 'X', null, null, null, 'X'];
        const result = calculateWinner(board, 3);
        expect(result.winner).toBe('X');
        expect(result.winningCells).toEqual([0, 4, 8]);
    });

    test('should detect O wins anitidiagonally', () => {
        const board = [null, null, 'O', null, 'O', null, 'O', null, null];
        const result = calculateWinner(board, 3);
        expect(result.winner).toBe('O');
        expect(result.winningCells).toEqual([2, 4, 6]);
    });

    test('should detect draw game', () => {
        const board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
        const result = calculateWinner(board, 3);
        expect(result.winner).toBe('Draw');
        expect(result.winningCells).toEqual([]);
    });

    test('should return null for ongoing game', () => {
        const board = ['X', null, 'O', null, 'X', null, null, null, null];
        const result = calculateWinner(board, 3);
        expect(result.winner).toBeNull();
        expect(result.winningCells).toEqual([]);
    });

    test('should detect win on 4×4 board', () => {
        const board = Array(16).fill(null);
        // Create a horizontal win
        board[0] = board[1] = board[2] = board[3] = 'X';
        const result = calculateWinner(board, 4);
        expect(result.winner).toBe('X');
        expect(result.winningCells).toEqual([0, 1, 2, 3]);
    });
});