// Minimal test runner (directive §2-G). Pure engine-external logic only — the
// analysis layer, error contract, fortune domain, and admin operational
// contracts have NO React Native / Expo imports, so a lightweight ts-jest setup
// runs them without the heavy jest-expo RN transform.
//
// isolatedModules: transpile-only (no full-project typecheck here) — `npx tsc
// --noEmit` remains the canonical type gate; jest just executes. Path alias `@/`
// is resolved via moduleNameMapper (ts-jest does not read tsconfig `paths`).
/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
  },
};
