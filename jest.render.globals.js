// Globals the RN/Expo runtime injects via babel, which ts-jest does not. Must run in `setupFiles`
// (before the environment's module registry serves anything), not `setupFilesAfterEnv`.
globalThis.__DEV__ = false;
