const DEFAULT_RETURN_URL = "/jobs";

export function sanitizeReturnUrl(value?: string | null, fallback = DEFAULT_RETURN_URL) {
  if (!value) return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//")) return fallback;
  return value;
}
