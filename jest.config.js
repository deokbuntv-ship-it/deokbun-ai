// Two runners, one command.
//
// `node`   — the original suite (302 files, `*.test.ts`). Its config is UNCHANGED, byte for byte,
//            so adding the render harness cannot disturb it.
// `render` — the component harness (`*.test.tsx`), added 2026-09-06 to close KNOWN_RISKS M5.
//            Renders through react-native-web into jsdom. See `docs/RENDER_HARNESS.md`.
//
// The two are separate jest *projects* rather than one merged config because they need different
// environments (node vs jsdom) and different module resolution (`react-native` is aliased only in
// the render project). `npx jest <path>` still filters across both.

/** The plain-Node runner, exactly as it was before the harness existed. */
const nodeProject = {
  displayName: 'node',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    // .ts/.tsx AND .js/.jsx — the latter so ESM-only node_modules that ship no
    // CJS build (e.g. qimen-dunjia) can be transpiled to CJS for the CJS runner.
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
  },
  // By default jest ignores node_modules for transformation. The 자미/기문 Cores
  // are ESM; allow the qimen Core (ESM) through so its `import`/`export` are
  // transpiled. (iztro ships a CJS build, so it does not need this.)
  transformIgnorePatterns: ['/node_modules/(?!(?:qimen-dunjia)/)'],
};

const renderProject = {
  displayName: 'render',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.tsx'],
  setupFiles: ['<rootDir>/jest.render.globals.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.render.setup.tsx'],
  moduleNameMapper: {
    // CSS FIRST: mappers are tried in order and the first match wins, so `@/global.css` would
    // otherwise be rewritten to a real path by the alias below and then handed to ts-jest as JS.
    '\\.css$': '<rootDir>/jest.render.cssMock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
    // react-native-web ships transpiled CJS, so ts-jest alone is enough — no babel, no RN source
    // transform, which is what makes this harness cheap enough to be worth having.
    '^react-native$': 'react-native-web',
  },
  // `.web.tsx` FIRST so the platform-split files (LineIcon, ConsumerNavGlyph, app-tabs) resolve to
  // the same variant the web build ships — including the inline-SVG LineIcon, which is why
  // react-native-svg needs no mock at all.
  moduleFileExtensions: ['web.tsx', 'web.ts', 'web.js', 'tsx', 'ts', 'jsx', 'js', 'json', 'node'],
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: 'tsconfig.jest.render.json' }],
  },
  // The expo family ships ESM only, and a screen reaches it transitively through barrels (e.g.
  // `@/features/admin` → useAdminAuthorization → `@/features/auth` → expo-auth-session). Transpiling
  // the whole scope is what keeps a new screen's first render test from opening with an unrelated
  // `Unexpected token 'export'`; enumerating packages one at a time does not scale.
  transformIgnorePatterns: ['/node_modules/(?!(?:qimen-dunjia|expo|expo-.*|@expo/.*)/)'],
};

/** @type {import('jest').Config} */
module.exports = { projects: [nodeProject, renderProject] };
