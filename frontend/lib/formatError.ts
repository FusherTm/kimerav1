export function formatError(err: any): string {
  const d = err?.response?.data;
  if (!d) return err?.message || 'Bir hata oluştu';
  if (typeof d === 'string') return d;
  const detail = d?.detail ?? d?.message ?? d?.error;
  if (Array.isArray(detail)) {
    return detail
      .map((e: any) => e?.msg || e?.detail || (typeof e === 'string' ? e : JSON.stringify(e)))
      .join('; ');
  }
  if (typeof detail === 'string') return detail;
  try { return JSON.stringify(d); } catch { return 'Bir hata oluştu'; }
}

