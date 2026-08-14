// Browser download for the generated .xlsx (§42). Web-only (admin is web-only). Returns a
// boolean so the caller renders truthful success/failure and NEVER a false "다운로드됨" when
// the browser blocked it (§57). Not imported by node tests.

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export function downloadXlsx(bytes: Uint8Array, filename: string): boolean {
  try {
    if (typeof document === 'undefined' || typeof URL === 'undefined' || typeof Blob === 'undefined') {
      return false;
    }
    // Copy into a fresh ArrayBuffer-backed view so Blob accepts it across environments.
    const buf = new Uint8Array(bytes.length);
    buf.set(bytes);
    const blob = new Blob([buf], { type: XLSX_MIME });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Revoke after the click has been dispatched.
    setTimeout(() => URL.revokeObjectURL(url), 0);
    return true;
  } catch {
    return false;
  }
}
