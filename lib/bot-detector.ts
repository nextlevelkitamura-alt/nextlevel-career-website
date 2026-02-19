const BOT_PATTERNS = [
  /bot/i, /crawl/i, /spider/i, /slurp/i,
  /mediapartners/i, /adsbot/i, /bingpreview/i,
  /lighthouse/i, /pagespeed/i, /headless/i,
  /phantom/i, /prerender/i, /wget/i, /curl/i,
  /python-requests/i, /httpie/i, /postman/i,
];

export function isBot(userAgent: string | null): boolean {
  if (!userAgent) return true;
  return BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
}
