// Deterministic pre-bundle of the chat Edge's runtime-neutral server graph into ONE Deno-safe ESM file.
//
// WHY: Supabase's Deno Edge runtime resolves imports strictly (explicit .ts / /index.ts) and does NOT
// honor `sloppy-imports`; the app graph (108 files incl. the FROZEN Saju engine) uses Node/Metro-style
// extensionless + directory imports, so the worker failed to boot ("Module not found … buildServerConsultation").
// esbuild resolves the whole local graph (extensions + index) and inlines it — WITHOUT editing any source —
// leaving only the 3 npm engine deps external (they stay `npm:` via the function's deno.json import map).
//
// Regenerate:  node supabase/functions/chat/_server/build.mjs
// The output (serverBundle.mjs) is committed so the Edge deploys without a build step.
import esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../'); // repo root
const SRC = path.join(ROOT, 'src');
const ENTRY = path.join(SRC, 'features/chat/server/index.ts');
const OUT = path.join(ROOT, 'supabase/functions/chat/_server/serverBundle.mjs');

const EXTS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json'];
function resolveFile(base) {
  if (path.extname(base) && fs.existsSync(base)) return base;
  for (const e of EXTS) if (fs.existsSync(base + e)) return base + e;
  for (const e of EXTS) if (fs.existsSync(path.join(base, 'index' + e))) return path.join(base, 'index' + e);
  return null;
}

// '@/x' -> src/x with explicit extension/index resolution. Relative imports (./foo, ../bar) are resolved
// by esbuild's default Node resolver (extensions + index), so no source needs editing.
const atAlias = {
  name: 'at-alias',
  setup(build) {
    build.onResolve({ filter: /^@\// }, (args) => {
      const f = resolveFile(path.join(SRC, args.path.slice(2)));
      if (!f) throw new Error(`@/ alias could not resolve: ${args.path}`);
      return { path: f };
    });
  },
};

await esbuild.build({
  entryPoints: [ENTRY],
  outfile: OUT,
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  target: 'es2022',
  charset: 'utf8',
  legalComments: 'none',
  logLevel: 'warning',
  // The deterministic engine libs stay external → resolved by deno.json to pinned npm: specifiers.
  external: ['iztro', 'lunar-javascript', 'qimen-dunjia', 'qimen-dunjia/*'],
  plugins: [atAlias],
  banner: {
    js: '// GENERATED FILE — do not edit. Source: src/features/chat/server/index.ts\n// Regenerate: node supabase/functions/chat/_server/build.mjs',
  },
});
console.log('bundled ->', path.relative(ROOT, OUT));
