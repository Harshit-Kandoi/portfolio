// The site is served from a sub-path (vite `base`, e.g. /portfolio/). Anything in public/ or
// under /api must be resolved against it instead of the domain root.
const BASE = import.meta.env.BASE_URL || '/';

/** URL for a file in public/, e.g. asset('profile.webp') → /portfolio/profile.webp */
export const asset = (path: string) => `${BASE}${path.replace(/^\/+/, '')}`;

/** URL for a Netlify function, e.g. apiUrl('send-email') → /portfolio/api/send-email */
export const apiUrl = (name: string) => asset(`api/${name}`);
