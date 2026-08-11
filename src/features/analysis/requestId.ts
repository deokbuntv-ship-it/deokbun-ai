// Correlation id for tracing one request across UI → gateway → engine → LLM → DB
// (directive §5). Opaque and PII-free. Generated at request time (not render), so
// non-determinism is fine. Kept dependency-free.
export function newRequestId(): string {
  const rand = Math.random().toString(36).slice(2, 10);
  const t = Date.now().toString(36);
  return `req_${t}_${rand}`;
}
