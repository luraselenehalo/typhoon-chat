/**
 * Picks a greeting key based on local time of day. The matching template
 * (with `{name}` placeholder) lives in the i18n dictionary.
 */
export function greetingKey(now: Date = new Date()): string {
  const h = now.getHours();
  if (h >= 5 && h < 11) return "greeting.morning";
  if (h >= 11 && h < 17) return "greeting.afternoon";
  if (h >= 17 && h < 22) return "greeting.evening";
  return "greeting.night";
}
