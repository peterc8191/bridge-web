// Neutral "no photo" placeholder (house outline on grey), inlined so it works offline.
export const FALLBACK_PHOTO =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 120"><rect width="90" height="120" fill="#8a8f9c"/><path d="M25 66 45 48l20 18v22H25z" fill="none" stroke="#c9ccd4" stroke-width="3" stroke-linejoin="round"/></svg>`,
  );

/**
 * CSS background for a listing photo. The placeholder is layered *under* the
 * photo, so it shows through if the photo fails to load (offline, dead URL)
 * without any JS error handling. Photos are opaque, so it's hidden otherwise.
 */
export function photoBackground(src: string | undefined): string {
  return src ? `url("${src}"), url("${FALLBACK_PHOTO}")` : `url("${FALLBACK_PHOTO}")`;
}
