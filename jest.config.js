/* eslint-env node */
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/', // игнорировать тесты в node_modules
    '<rootDir>/dist/', // игнорировать тесты в директории dist
  ],
};