// PreToolUse guard: refuse any Bash command that names the PRODUCTION Supabase project.
//
// Why a hook and not a permission rule: permission patterns match a command PREFIX
// (`Bash(npx supabase db push *)`), so they cannot express "contains the production ref
// anywhere". The ref can appear after any flag, in any order, or inside a subshell — the only
// reliable check is a substring scan of the whole command, which is what this does.
//
// Context: until 2026-09-02 the CLI was linked to production and supabase/config.toml named it,
// so a bare `db push` / `functions deploy` would have shipped there. Both defaults are now
// staging. This hook is the second layer: even when production is named ON PURPOSE, it stops and
// makes a human do it.
//
// Fail-open by design. A guard that crashes must not wedge every Bash call; the permission
// allowlist is still the first layer, and an unreadable payload means there is nothing to judge.
const PRODUCTION_REF = 'olvkpaldrwvtexxpoaag';

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (d) => { raw += d; });
process.stdin.on('end', () => {
  let command = '';
  try {
    command = String(JSON.parse(raw || '{}')?.tool_input?.command ?? '');
  } catch {
    process.exit(0); // unparseable payload → nothing to judge
  }
  if (!command.includes(PRODUCTION_REF)) process.exit(0);

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason:
        `이 명령에 PRODUCTION 프로젝트 ref(${PRODUCTION_REF})가 들어 있습니다. `
        + '자율 작업 중 프로덕션 접근은 차단됩니다. 정말 필요하면 오너가 직접 실행하세요. '
        + `(staging = aephpsiurgkvqcswyeie)`,
    },
  }));
  process.exit(0);
});
