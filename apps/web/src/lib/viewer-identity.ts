export const VIEWER_COOKIE = "ctl-viewer";

export function anonymousViewerId(value: string | undefined): string | undefined {
  return value && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(value) ? value : undefined;
}
