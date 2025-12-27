const ASSET_BASE: string =
  (import.meta.env.VITE_PUBLIC_ASSET_BASE as string | undefined) ??
  (import.meta.env.BASE_URL as string | undefined) ??
  '/';

/**
 * Build a URL under the configured asset base, avoiding duplicate slashes.
 * Example: assetUrl('music/songs/ode-to-joy.mid') ->
 *   '/sightread/music/songs/ode-to-joy.mid' when ASSET_BASE='/sightread/'.
 */
export function assetUrl(path: string): string {
  const base = ASSET_BASE.replace(/\/+$/, '/');
  const normalizedPath = path.replace(/^\/+/, '');
  return base + normalizedPath;
}
