# Harshit Kandoi — Portfolio (v3)

A scroll-first portfolio with **HarshitVerse**, an optional playable 3D adventure for desktop, phone and tablet browsers. Explore an original voxel island, meet the guide, and discover real projects, career details, articles, and contact links. New visitors start in the responsive classic portfolio; a saved game preference opens the lobby on any screen.

Live at **https://portfolio.harshitkandoi.in/**.

---

## Features

- **Classic portfolio** (default for every visitor): hero, selected work, services, experience, contact form.
- **HarshitVerse**: a cinematic lobby, original instanced voxel scenery, a custom animated avatar, movement/camera controls, collision, and an interactive island.
- **Seven destinations**: Central Hub, Project District, Cloud Citadel, Career Guild, AI Nexus, Knowledge Tavern, Contact Beacon. Portfolio panels and fast travel are available immediately.
- **Exploration**: a guide with predefined dialogue, world map/minimap, introductory quest, and browser-local progress. No account or API required.
- **Accessibility**: direct portfolio/resume access, HTML content panels, keyboard focus management, WebGL fallback, graphics presets, reduced motion, and optional original ambient audio.

Open the **HarshitVerse** button on the classic page, then **Enter World**. Controls: WASD/arrows to move, Shift to sprint, Space to jump, E to interact, M for map, Tab for journal, Esc to pause. Click the world to capture the mouse; scroll to adjust camera distance. See [architecture and verification](docs/harshitverse.md).

On touch screens, drag the left movement stick, swipe the scene to look, and pinch to zoom. Tap Sprint to toggle running, Jump to jump, and a nearby interaction prompt to open content. Places, World map, Journal and Settings are always available. Portrait and landscape are supported; phones start with low graphics unless a saved setting overrides it.

## Tech

React 18 · TypeScript · Vite · Three.js · Tailwind CSS · Zustand · Framer Motion · Lucide · Netlify Functions · Vitest · Playwright · Lighthouse CI

## Getting started

Requires Node.js 22+.

```bash
npm install
npm run dev        # http://localhost:5173/
```

`npm run dev` also runs the Netlify functions in `netlify/functions` at `/api/*`, so the contact form and GitHub stats work locally (put `RESEND_API_KEY` in `.env`; see `.env.example`).

| Script | What it does |
| --- | --- |
| `npm run build` / `npm run preview` | Production build (incl. prerender, see below) / serve it at `localhost:4173` |
| `npm run typecheck` · `npm run lint` | TypeScript and ESLint |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | Browser tests (Playwright) |
| `npm run lighthouse` | Build + Lighthouse (mobile, median of 3 runs) |
| `npm run fetch-medium` | Refresh `src/data/blogs.ts` from Medium (`--dry-run` to preview) |

## Where content lives

- **Identity** (name, role, links, site URL, version): `src/data/config.ts` → `PORTFOLIO_META`, `APP_VERSION`.
- **Experience, education, certifications**: `src/data/experience.ts`.
- **Projects**: `src/data/projects.ts` (game terminals and the classic page read from it).
- **SEO**: `index.html` (title, description, canonical, JSON-LD). `src/__tests__/seo.test.ts` fails if it drifts from `config.ts`.

## Prerendering

`npm run build` also renders the classic page to static HTML (`src/entry-prerender.tsx` → `scripts/prerender.mjs`) and puts it inside `#root` in `dist/index.html`. The headline paints before any JavaScript runs (~25% faster first paint on slow 4G), and crawlers and visitors without JavaScript get the full page. React then renders over it with `createRoot` (not hydration), so per-visitor state such as the dark theme can't cause mismatches. A tiny inline script applies the saved theme. The prerender stays available even for saved game sessions if the app bundle fails to load.

## Deployment

Netlify builds `dist/` and deploys `netlify/functions` (see `netlify.toml`). The site is the
Netlify project `harshit-kandoi.netlify.app` with the custom domain `portfolio.harshitkandoi.in`
(add it under Domain management and point a CNAME record for `portfolio` at
`harshit-kandoi.netlify.app`).

### Environment variables (Netlify → Site configuration → Environment variables)

| Variable | Used by | Notes |
| --- | --- | --- |
| `RESEND_API_KEY` | `send-email` function | Required for the contact form |
| `CONTACT_TO`, `CONTACT_FROM` | `send-email` | `CONTACT_FROM` must be a domain verified in Resend |
| `ALLOWED_ORIGINS` | `send-email` | Extra origins allowed to post (comma-separated) |
| `GITHUB_TOKEN` | `github-stats` function | Optional, server-only (never `VITE_`-prefixed) |
| `VITE_GA_MEASUREMENT_ID`, `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST` | Analytics | Public by design |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Notes / Products | Optional; bundled data is used when unset |

The contact form function is rate limited at Netlify's edge (5 requests/minute per IP), checks the request origin, has a honeypot field and escapes everything it puts in the email.

## Analytics

Google Analytics 4 and PostHog (both respect Do Not Track). Every link/button click on the classic page is recorded as a `ui_click` event with a label, section and link type; PostHog heatmaps are enabled. See `ANALYTICS.md`.
