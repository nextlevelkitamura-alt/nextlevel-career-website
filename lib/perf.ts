export function createPerfTimer(action: string, meta?: Record<string, unknown>) {
  const startedAt = Date.now();

  return {
    end(extra?: Record<string, unknown>) {
      const durationMs = Date.now() - startedAt;
      console.info("[perf]", JSON.stringify({
        action,
        duration_ms: durationMs,
        ...meta,
        ...extra,
      }));
      return durationMs;
    },
  };
}
