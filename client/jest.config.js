/** @type {import('jest').Config} */
const config = {
    testEnvironment: 'jsdom',
    testMatch: [
        '**/__tests__/**/*.test.js',
    ],
    collectCoverageFrom: [
        'src/utils/*.js',
        '!src/utils/themeUtils.js'
    ],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
};

export default config;