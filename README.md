# Harshit Kandoi — Portfolio (v3)

A scroll-first portfolio with an optional **interactive mode**: a desktop-style "Portfolio OS" (and an Android-style shell on phones) with windows, a terminal, an offline assistant and a small arcade.

Live at **https://www.harshitkandoi.in/portfolio/**.

---

## Features

- **Classic portfolio** (default for every visitor): hero, selected work, services, experience, contact form.
- **Interactive mode**: draggable/resizable windows, themes, sounds, achievements and XP.
  - Apps: About, Projects, Experience, Skills, Certifications, Resume, Products, Contact, Swipe, Terminal, Assistant, **Writing** (blog + dev notes), **Arcade** (dev RPG + Snake), Settings.
  - **Assistant** runs fully offline (no LLM/API calls): a small intent engine answers from `src/data`.
- **Android shell** on phones and as a simulator on desktop.

## Tech

React 18 · TypeScript · Vite · Tailwind CSS · Zustand · Framer Motion · Lucide · Netlify Functions · Vitest · Playwright · Lighthouse CI

## Getting started

Requires Node.js 22+.

```bash
npm install
npm run dev        # http://localhost:5173/portfolio/
```

`npm run dev` also runs the Netlify functions in `netlify/functions` at `/portfolio/api/*`, so the contact form and GitHub stats work locally (put `RESEND_API_KEY` in `.env`; see `.env.example`).

| Script | What it does |
| --- | --- |
| `npm run build` / `npm run preview` | Production build (incl. prerender, see below) / serve it at `localhost:4173/portfolio/` |
| `npm run typecheck` · `npm run lint` | TypeScript and ESLint |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | Browser tests (Playwright) |
| `npm run lighthouse` | Build + Lighthouse (mobile, median of 3 runs) |
| `npm run fetch-medium` | Refresh `src/data/blogs.ts` from Medium (`--dry-run` to preview) |

## Where content lives

- **Identity** (name, role, links, site URL, version): `src/data/config.ts` → `PORTFOLIO_META`, `APP_VERSION`.
- **Experience, education, certifications**: `src/data/experience.ts`.
- **Projects**: `src/data/projects.ts` (Products, Swipe and the classic page read from it).
- **SEO**: `index.html` (title, description, canonical, JSON-LD). `src/__tests__/seo.test.ts` fails if it drifts from `config.ts`.

## Prerendering

`npm run build` also renders the classic page to static HTML (`src/entry-prerender.tsx` → `scripts/prerender.mjs`) and puts it inside `#root` in `dist/index.html`. The headline paints before any JavaScript runs (~25% faster first paint on slow 4G), and crawlers and visitors without JavaScript get the full page. React then renders over it with `createRoot` (not hydration), so per-visitor state such as the dark theme can't cause mismatches; a tiny inline script applies the saved theme, or clears the page for visitors who left in interactive mode, before first paint.

## Deployment

Netlify builds `dist/` and deploys `netlify/functions` (see `netlify.toml`). The app is built with `base: '/portfolio/'`:

- On this Netlify site, `/` redirects to `/portfolio/` and `/portfolio/*` maps onto the files in `dist/`.
- To serve it from the company domain, the company site proxies the path to this site, e.g. in the company site's `netlify.toml`:

  ```toml
  [[redirects]]
    from = "/portfolio/*"
    to = "https://harshit-kandoi.netlify.app/portfolio/:splat"
    status = 200
    force = true
  ```

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
