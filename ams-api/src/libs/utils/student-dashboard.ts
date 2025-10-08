
type RawRpc = any;

function safeNum(v: unknown): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function normalizeRpcPayload(raw: RawRpc) {
  // Supabase sometimes returns an array with single element
  const payload = Array.isArray(raw) ? (raw[0] ?? {}) : raw ?? {};

  const statsRaw = payload.stats ?? {};
  const coursesRaw = Array.isArray(payload.courses) ? payload.courses : [];

  const stats = {
    overall_attendance: safeNum(statsRaw.overall_attendance),
    total_courses: safeNum(statsRaw.total_courses),
    sessions_today: safeNum(statsRaw.sessions_today),
    total_sessions_attended: safeNum(statsRaw.total_sessions_attended),
  };

  const courses = coursesRaw.map((c: any) => ({
    id: safeNum(c.id),
    code: c.code ?? null,
    title: c.title ?? null,
    attendance_percentage: safeNum(c.attendance_percentage),
    total_sessions: safeNum(c.total_sessions),
    attended_sessions: safeNum(c.attended_sessions),
    last_attended: c.last_attended ?? null,
    lecturer: c.lecturer ?? null,
  }));

  return { stats, courses };
}
