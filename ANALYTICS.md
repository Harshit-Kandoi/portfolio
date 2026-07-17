# Portfolio OS – Analytics System Integration

This repository implements a production-ready, centralized, privacy-conscious analytics system combining **Google Analytics 4 (GA4)** and **PostHog** under a unified API.

---

## 1. Environment Variables

The analytics system pulls configuration parameters directly from environment variables. Do **not** hardcode credentials.

Configure the following variables in your `.env` or `.env.local` file:

```bash
# Google Analytics 4 Measurement ID (e.g. G-XXXXXXXXXX)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# PostHog API Key & Endpoint
VITE_POSTHOG_KEY=phc_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

If these environment variables are missing, the providers will simply not initialize, preventing runtime crashes.

---

## 2. Initialization Flow

The analytics service is booted in [main.tsx](file:///Users/alka/Desktop/GitHub/portfolio/src/main.tsx) during application start:

```typescript
import { initAnalytics } from './utils/analytics.ts';

// Initializes scripts asynchronously and buffers early events in memory
initAnalytics();
```

### Core Architecture Capabilities
1. **Dynamic Asynchronous Script Loading**: GA4 scripts are loaded asynchronously dynamically on runtime without blocking critical rendering paths or affecting Lighthouse performance scores.
2. **In-Memory Event Queue**: Any events fired before the SDK scripts finish loading (e.g. clicking the resume download within 500ms of boot) are buffered in memory and flushed immediately upon script completion.
3. **Offline In-Memory Buffer**: If the user loses internet connection (`navigator.onLine === false`), events are queued and flushed as soon as the window fires an `online` reconnection event.
4. **GDPR & Privacy Compliance**:
   - Respects browser **Do Not Track (DNT)** settings. If DNT is active, analytics setup is suspended, and no network requests are dispatched.
   - IP Anonymization is enabled by default for both providers.
   - AI Assistant query texts are never logged; only query character lengths and categorized keywords are sent.

---

## 3. Event Naming Convention

All custom events follow the `category_action` snake_case naming scheme to ensure consistency and readability in GA4 Custom Definitions and PostHog Trends.

### Event Definitions

| Category | Event Name | Properties | Description |
| :--- | :--- | :--- | :--- |
| **System** | `app_open` | `app_id` | Simulated app window is launched. |
| **System** | `app_close` | `app_id` | Simulated app window is closed. |
| **System** | `app_minimize` | `app_id` | Window is minimized. |
| **System** | `app_maximize` | `app_id` | Window is maximized. |
| **System** | `app_duration` | `app_id`, `duration` | Focus duration (seconds) spent inside this application. |
| **System** | `achievement_unlock` | `achievement_id`, `achievement_title` | Visitor unlocked an RPG achievement. |
| **Performance**| `performance_vital_report` | `vital_name`, `vital_value`, `vital_rating`, `vital_delta` | Performance metrics (LCP, FCP, CLS, INP, TTFB). |
| **About** | `about_spotify_open` | — | Spotify lofi playlist loaded on desktop. |
| **Resume** | `resume_download` | — | Resume PDF downloaded. |
| **Resume** | `resume_print` | — | Print resume command fired. |
| **Projects** | `project_open` | `project_title`, `project_id` | Detailed project modal/panel opened. |
| **Projects** | `project_github_click` | `project_title` | Navigated to a project's github repository. |
| **Projects** | `project_demo_click` | `project_title` | Navigated to a project's live demo. |
| **Projects** | `project_category_change` | `category` | Selected category filter inside file explorer. |
| **Skills** | `skills_node_click` | `skill_name`, `view` | Gained focus on skill in graph/grid. |
| **Blog** | `blog_article_open` | `article_title`, `article_id` | Opened preview of blog article. |
| **Blog** | `blog_article_complete` | `article_title`, `article_id` | Clicked external link to read full post on Medium. |
| **Blog** | `blog_article_share` | `article_title`, `article_id` | Copied article link to clipboard to share. |
| **Contact** | `contact_submit` | — | Submitted form, redirecting to mail client. |
| **Contact** | `contact_email_click` | `action` (`open` or `copy`) | Connection email copied or mailto link clicked. |
| **Contact** | `contact_linkedin_click` | — | Visited LinkedIn page. |
| **Contact** | `contact_github_click` | — | Visited GitHub page from contact pane. |
| **AI** | `ai_query_submit` | `query_length`, `query_category` | AI query sent (raw text omitted for privacy). |
| **AI** | `ai_self_destruct` | — | User triggered AI self-destruction countdown. |
| **Terminal** | `terminal_easter_egg` | `easter_egg` | Easter egg activated (e.g. `'matrix'` rain). |
| **Snake** | `snake_game_start` | — | Retro Snake game started. |
| **Snake** | `snake_game_over` | `score` | Snake game ended. |
| **Snake** | `snake_high_score` | `score` | User broke their local high score. |
| **Swipe** | `swipe_role_like` | `role_title`, `match_percentage` | Swiped right on role. |
| **Swipe** | `swipe_role_pass` | `role_title` | Swiped left on role. |
| **Swipe** | `swipe_match_create` | `role_title`, `match_percentage` | Match created (swiped right). |
| **Swipe** | `swipe_profile_open` | `role_title` | Detailed role bio pane loaded. |
| **Coffee** | `coffee_select` | `tier_id`, `price` | Coffee tier or custom amount selected. |
| **Coffee** | `coffee_support_click` | `price` | Mock payment checkout initiated. |

---

## 4. Session & User Metadata

Every event payload is automatically populated with the following properties:
- `session_id`: Unique cryptographically generated string persisted in `sessionStorage` (resets when closing browser tab).
- `visit_number`: Integer count of overall visits of this client browser (stored in `localStorage`).
- `first_visit`: Boolean flag evaluating to `true` if `visit_number === 1`.
- `analytics_version`: pulled from configuration (`v1.0`).
- `portfolio_version`: pulled from configuration (`2.4.0`).
- `theme`: current active style theme (`midnight`, `cyberpunk`, `retro`, etc.).
- `device_type`: physical hardware category (`desktop`, `tablet`, `mobile`).
- `view_mode`: current viewport setting (`desktop`, `tablet`, `mobile`).
- `referrer`: `document.referrer` or `'direct'`.
- UTM URL parameters (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`) if present in the URL search query.

---

## 5. How to Add New Events

To log an event, import `trackEvent` from [analytics.ts](file:///Users/alka/Desktop/GitHub/portfolio/src/utils/analytics.ts):

```typescript
import { trackEvent } from '../../utils/analytics';

// Simple Event
trackEvent('achievement_unlock', { 
  achievement_id: 'easter_egg', 
  achievement_title: 'AI Destroyer' 
});

// Selective Routing (e.g., PostHog only)
trackEvent('snake_game_start', {}, { providers: ['posthog'] });
```

If you need to track simulated navigation routes for journey funnel mapping:

```typescript
import { trackPageView } from '../../utils/analytics';

// Triggers simulated path views
trackPageView('Skills App', '/apps/skills');
```

---

## 6. Testing & Debug Mode

### Development Console Log Card
During local testing (`import.meta.env.DEV`), events are printed directly in the browser's developer console in a highly structured, readable card layout:

```
📊 [Analytics]

Event
resume_download

Provider
GA4 • PostHog

Properties
{
  "session_id": "sess_8n239vnsdkljfsdf",
  "visit_number": 2,
  "first_visit": false,
  "analytics_version": "v1.0",
  "portfolio_version": "2.4.0",
  "timestamp": "2026-07-17T10:00:00.000Z"
}
```

### Analytics Health Check
Upon initialization, the service prints a diagnostics health status grid:

```
📊 [Analytics Health Check]
  🟢 ✓ GA4 Loaded
  🟢 ✓ PostHog Loaded
  🟢 ✓ Web Vitals Enabled
  🟢 🟢 DNT Disabled
```

### Dummy Testing (Preventing Real Ingestion)
To test analytics locally without mixing testing records into actual production reports:
1. **Local Log Only (Strategy A)**: Simply do not provide the `VITE_GA_MEASUREMENT_ID` and `VITE_POSTHOG_KEY` env variables in `.env.local`. The console debugger will still print the preformatted event log cards, but no real tracking scripts will load.
2. **Do Not Track (Strategy B)**: Enable "Do Not Track" in your browser. The system will detect this setting, log `✗ Suspended (DNT)` in the health check, and completely stop all script loading and event dispatches.

---

## 7. Dashboard Recommendations

### Google Analytics 4 (GA4)
- **User Journey Funnel Analysis**: Build a funnel using custom pageviews:
  `Desktop (/)` ➔ `/apps/projects` ➔ `/apps/resume` ➔ `resume_download` (conversion)
- **Acquisition Source Report**: Plot UTM sources (`utm_source` / `utm_medium`) to evaluate traffic coming from LinkedIn, GitHub README links, or direct shares.
- **Engagement Duration Report**: Analyze average timing spent in various app modules by plotting `app_duration` event value averages grouped by `app_id`.

### PostHog
- **Session Recordings**: Review recordings filtered by `app_duration` or `contact_submit` to see how recruiters interact with your apps.
- **Role Swipe Retention Matrix**: Create a cohort of users who perform `swipe_role_like` and trace their retention across multiple days.
- **AI Query Category Heatmap**: Group `ai_query_submit` by `query_category` to see what topics visitors ask the AI guide about (e.g. asking about GCP vs. asking about resume).
