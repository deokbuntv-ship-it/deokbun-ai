// Local ambient types for the JS-only `qimen-dunjia` CJS dist build. The library
// ships no .d.ts; we declare only the two functions DeokbunAI uses. Kept beside
// the adapter that consumes them so the coupling stays isolated.
declare module 'qimen-dunjia/dist/qimen.min.js' {
  export function generateChartByDatetime(datetime: string): unknown;
  export function chartToObject(chart: unknown): Record<string, unknown>;
}
