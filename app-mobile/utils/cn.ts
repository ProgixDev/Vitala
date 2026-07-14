/** Join class names, dropping falsy values. Later classes win in NativeWind. */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}
