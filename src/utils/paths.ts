// Resolves public/ files and Netlify functions against vite's `base` ("/" today), so the
// site keeps working if it is ever served from a sub-path again.
const BASE = import.meta.env.BASE_URL || '/';

/** URL for a file in public/, e.g. asset('profile.webp') → /profile.webp */
export const asset = (path: string) => `${BASE}${path.replace(/^\/+/, '')}`;

/** URL for a Netlify function, e.g. apiUrl('send-email') → /api/send-email */
export const apiUrl = (name: string) => asset(`api/${name}`);

/**
 * For image fields in src/data (e.g. project.image): full URLs pass through, and paths like
 * "projects/foo.webp" become /projects/foo.webp, so they load no matter which page URL is open.
 */
export const resolveAsset = (src: string) =>
  /^(https?:)?\/\//.test(src) || src.startsWith('data:') ? src : asset(src);
