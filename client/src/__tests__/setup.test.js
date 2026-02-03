// Simple test to verify Jest is working
describe('Test Setup Verification', () => {
    test('Jest is configured correctly', () => {
        expect(1 + 1).toBe(2);
    });

    test('Array operations work', () => {
        const arr = [1, 2, 3];
        expect(arr.length).toBe(3);
        expect(arr.map(x => x * 2)).toEqual([2, 4, 6]);
    });

    test('String operations work', () => {
        const str = 'Tic Tac Toe';
        expect(str.length).toBe(11);
        expect(str.includes('Tac')).toBe(true);
    });
});