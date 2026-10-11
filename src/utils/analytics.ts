import type { PostHog } from 'posthog-js';
import { onLCP, onFCP, onCLS, onINP, onTTFB, Metric } from 'web-vitals';
import { APP_VERSION, ANALYTICS_VERSION } from '../data/config';

// ─── TS Types ────────────────────────────────────────────────────────────────
export interface TrackOptions {
  providers?: ('ga4' | 'posthog')[];
}

interface QueuedEvent {
  type: 'event' | 'page_view' | 'user_properties';
  name?: string;
  properties?: Record<string, unknown>;
  pageTitle?: string;
  path?: string;
  options?: TrackOptions;
}

// ─── Private Module State ────────────────────────────────────────────────────
let isInitialized = false;
let isGA4Initialized = false;
let isPostHogInitialized = false;
let isWebVitalsEnabled = false;

const eventQueue: QueuedEvent[] = [];
// posthog-js (~50 KB gz) is loaded on demand in initAnalytics, keeping it out of the main bundle.
let posthog: PostHog | null = null;
const MAX_QUEUE = 200;

// A provider only counts if its key is configured; otherwise events would wait for it forever.
const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
const PH_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const isConfigured = (provider: 'ga4' | 'posthog') => (provider === 'ga4' ? !!GA_ID : !!PH_KEY);
const isProviderReady = (provider: 'ga4' | 'posthog') =>
  !isConfigured(provider) || (provider === 'ga4' ? isGA4Initialized : isPostHogInitialized);
const allProvidersReady = () => isProviderReady('ga4') && isProviderReady('posthog');

const enqueue = (item: QueuedEvent) => {
  if (eventQueue.length >= MAX_QUEUE) eventQueue.shift();
  eventQueue.push(item);
};

// Generate Session ID once per tab session using cryptographically secure UUID
const sessionId = (() => {
  const key = 'portfolio-os-session-id';
  try {
    let id = sessionStorage.getItem(key);
    if (!id) {
      if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
        id = 'sess_' + window.crypto.randomUUID();
      } else {
        id = 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      }
      sessionStorage.setItem(key, id);
    }
    return id;
  } catch {
    return 'sess_fallback_' + Math.random().toString(36).substring(2, 10);
  }
})();

// Track persistent client visit count
const { visitNumber, isFirstVisit } = (() => {
  const key = 'portfolio-os-visit-number';
  try {
    const raw = localStorage.getItem(key);
    const prev = raw ? parseInt(raw, 10) : 0;
    const current = prev + 1;
    localStorage.setItem(key, String(current));
    return { visitNumber: current, isFirstVisit: current === 1 };
  } catch {
    return { visitNumber: 1, isFirstVisit: true };
  }
})();

// ─── Privacy Helper ──────────────────────────────────────────────────────────
export const isDoNotTrackEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  const nav = navigator as Navigator & { doNotTrack?: string; msDoNotTrack?: string };
  const win = window as Window & typeof globalThis & { doNotTrack?: string };
  const dnt = nav.doNotTrack || win.doNotTrack || nav.msDoNotTrack;
  return dnt === '1' || dnt === 'yes';
};

// Check if browser is online
const isOnline = (): boolean => {
  return typeof navigator !== 'undefined' && navigator.onLine !== false;
};

// Get device metadata
const getDeviceType = (): 'desktop' | 'tablet' | 'mobile' => {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'tablet';
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) return 'mobile';
  return 'desktop';
};

// Extract UTM query parameters from current URL
const getUtmParameters = (): Record<string, string> => {
  const params: Record<string, string> = {};
  if (typeof window === 'undefined') return params;
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const utms = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    utms.forEach((key) => {
      const val = searchParams.get(key);
      if (val) params[key] = val;
    });
  } catch { /* noop */ }
  return params;
};

// Stylized Dev Debug Logger
const logToConsole = (name: string, properties: Record<string, unknown>, providers: string[]) => {
  if (!import.meta.env.DEV) return;
  console.log(
    `%c📊 [Analytics]\n\n` +
    `%cEvent\n%c${name}\n\n` +
    `%cProvider\n%c${providers.join(' • ')}\n\n` +
    `%cProperties\n%c${JSON.stringify(properties, null, 2)}`,
    'color: #a855f7; font-weight: 800; font-size: 13px;',
    'color: #94a3b8; font-size: 10px; text-transform: uppercase; font-weight: bold;',
    'color: #f1f5f9; font-weight: bold; font-size: 12px; background: #1e1b4b; padding: 2px 6px; border-radius: 4px;',
    'color: #94a3b8; font-size: 10px; text-transform: uppercase; font-weight: bold;',
    'color: #34d399; font-weight: bold;',
    'color: #94a3b8; font-size: 10px; text-transform: uppercase; font-weight: bold;',
    'color: #e2e8f0; font-family: monospace; font-size: 11px;'
  );
};

// Flush buffered events
const flushQueue = () => {
  if (eventQueue.length === 0 || !isOnline()) return;

  // Process items in order
  const remaining: QueuedEvent[] = [];

  for (const item of eventQueue) {
    let processed = false;

    if (item.type === 'event' && item.name) {
      processed = dispatchEventImmediately(item.name, item.properties || {}, item.options || {});
    } else if (item.type === 'page_view' && item.path) {
      processed = dispatchPageViewImmediately(item.pageTitle || '', item.path, item.properties || {});
    } else if (item.type === 'user_properties' && item.properties) {
      processed = dispatchUserPropertiesImmediately(item.properties);
    }

    if (!processed) {
      remaining.push(item);
    }
  }

  // Clear and update queue
  eventQueue.length = 0;
  eventQueue.push(...remaining);
};

// Dispatch standard event
const dispatchEventImmediately = (name: string, properties: Record<string, unknown>, options: TrackOptions): boolean => {
  const providers = (options.providers || ['ga4', 'posthog']).filter(isConfigured);
  if (providers.length === 0) return true; // nothing configured (local dev): drop silently
  const sentProviders: string[] = [];

  // Bind session context to every payload
  const payload = {
    ...properties,
    session_id: sessionId,
    visit_number: visitNumber,
    first_visit: isFirstVisit,
    analytics_version: ANALYTICS_VERSION,
    portfolio_version: APP_VERSION,
    timestamp: new Date().toISOString(),
  };

  // 1. Send to GA4 if ready and requested
  if (providers.includes('ga4')) {
    if (isGA4Initialized && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', name, payload);
      sentProviders.push('GA4');
    } else {
      return false; // Fail to process yet
    }
  }

  // 2. Send to PostHog if ready and requested
  if (providers.includes('posthog')) {
    if (isPostHogInitialized && posthog) {
      posthog.capture(name, payload);
      sentProviders.push('PostHog');
    } else {
      return false; // Fail to process yet
    }
  }

  if (sentProviders.length > 0) {
    logToConsole(name, payload, sentProviders);
    return true;
  }
  return false;
};

// Dispatch simulated page view
const dispatchPageViewImmediately = (pageTitle: string, path: string, properties: Record<string, unknown>): boolean => {
  const payload = {
    page_title: pageTitle,
    page_path: path,
    session_id: sessionId,
    visit_number: visitNumber,
    first_visit: isFirstVisit,
    analytics_version: ANALYTICS_VERSION,
    portfolio_version: APP_VERSION,
    ...properties,
  };

  let ga4Sent = false;
  let posthogSent = false;

  // 1. Send to GA4
  if (isGA4Initialized && typeof window !== 'undefined' && window.gtag) {
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (gaId) {
      window.gtag('event', 'page_view', {
        ...payload,
        send_to: gaId
      });
      ga4Sent = true;
    }
  }

  // 2. Send to PostHog
  if (isPostHogInitialized && posthog) {
    posthog.capture('$pageview', {
      $current_url: window.location.origin + path,
      $pathname: path,
      $title: pageTitle,
      ...payload,
    });
    posthogSent = true;
  }

  const sent: string[] = [];
  if (ga4Sent) sent.push('GA4');
  if (posthogSent) sent.push('PostHog');

  if (sent.length > 0) {
    logToConsole(`page_view: ${path}`, payload, sent);
    return true;
  }
  return false;
};

// Dispatch user properties
const dispatchUserPropertiesImmediately = (properties: Record<string, unknown>): boolean => {
  let ga4Sent = false;
  let posthogSent = false;

  // 1. Send to GA4
  if (isGA4Initialized && typeof window !== 'undefined' && window.gtag) {
    window.gtag('set', 'user_properties', properties);
    ga4Sent = true;
  }

  // 2. Send to PostHog
  if (isPostHogInitialized && posthog) {
    posthog.setPersonProperties(properties);
    posthogSent = true;
  }

  const sent: string[] = [];
  if (ga4Sent) sent.push('GA4');
  if (posthogSent) sent.push('PostHog');

  if (sent.length > 0) {
    logToConsole('set_user_properties', properties, sent);
    return true;
  }
  return false;
};

// ─── Public API ──────────────────────────────────────────────────────────────

// Initialize Analytics Providers
export const initAnalytics = () => {
  if (isInitialized) return;
  isInitialized = true;

  const dnt = isDoNotTrackEnabled();

  // Print initial headers
  if (import.meta.env.DEV) {
    console.log(
      `%c📊 [Analytics] Initializing...\n` +
      `Mode: ${import.meta.env.DEV ? 'Development' : 'Production'}\n` +
      `DNT Settings: ${dnt ? 'Enabled (Tracking Suspended)' : 'Disabled'}`,
      'color: #a855f7; font-weight: bold;'
    );
  }

  if (dnt) {
    printHealthReport();
    return; // Suspend tracking
  }

  // 1. GA4 Dynamic Loading
  const gaId = GA_ID;
  if (gaId) {
    try {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      script.onload = () => {
        isGA4Initialized = true;
        flushQueue();
        printHealthReport();
      };
      script.onerror = () => {
        console.error('📊 [Analytics] Failed to load GA4 script');
        printHealthReport();
      };
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function (...args: unknown[]) {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer.push(arguments);
        void args;
      };
      window.gtag('js', new Date());
      window.gtag('config', gaId, {
        anonymize_ip: true,
        send_page_view: false, // Page views sent manually to model app navigation
      });
    } catch (e) {
      console.error('📊 [Analytics] GA4 setup error:', e);
    }
  }

  // 2. PostHog Loading
  const phKey = PH_KEY;
  const phHost = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';
  if (phKey) {
    import('posthog-js').then(({ default: ph }) => {
      posthog = ph;
      ph.init(phKey, {
        api_host: phHost,
        ip: false, // anonymize IP
        persistence: 'localStorage',
        respect_dnt: true,
        // Click heatmaps + scroll depth, viewable later in PostHog → Toolbar → Heatmap.
        enable_heatmaps: true,
        capture_pageleave: true,
        loaded: () => {
          isPostHogInitialized = true;
          flushQueue();
          printHealthReport();
        },
      });
    }).catch((e) => {
      console.error('📊 [Analytics] PostHog setup error:', e);
    });
  }

  // 3. Web Vitals setup
  setupWebVitals();

  // 4. Global Error Catching
  setupGlobalErrorCatching();

  // 5. Named click events for later analysis
  setupClickTracking();

  // 6. Connection changes listener
  window.addEventListener('online', flushQueue);

  // Set initial session attributes
  setUserProperties({
    portfolio_version: APP_VERSION,
    analytics_version: ANALYTICS_VERSION,
    device_type: getDeviceType(),
    referrer: document.referrer || 'direct',
    ...getUtmParameters(),
  });
};

// Print central initialization diagnostics
const printHealthReport = () => {
  if (!import.meta.env.DEV) return;
  
  const dnt = isDoNotTrackEnabled();
  const gaStatus = dnt ? '✗ Suspended (DNT)' : (isGA4Initialized ? '✓ GA4 Loaded' : '... GA4 Loading');
  const phStatus = dnt ? '✗ Suspended (DNT)' : (isPostHogInitialized ? '✓ PostHog Loaded' : '... PostHog Loading');
  const wvStatus = dnt ? '✗ Suspended (DNT)' : (isWebVitalsEnabled ? '✓ Web Vitals Enabled' : '✗ Web Vitals Disabled');
  const dntStatus = dnt ? '✗ DNT Enabled' : '✓ DNT Disabled';

  console.log(
    `%c📊 [Analytics Health Check]\n` +
    `  ${gaStatus.startsWith('✓') ? '🟢' : '🔴'} ${gaStatus}\n` +
    `  ${phStatus.startsWith('✓') ? '🟢' : '🔴'} ${phStatus}\n` +
    `  ${wvStatus.startsWith('✓') ? '🟢' : '🔴'} ${wvStatus}\n` +
    `  ${dntStatus.startsWith('✓') ? '🟢' : '🔴'} ${dntStatus}`,
    'color: #c084fc; font-weight: bold;'
  );
};

// Track regular analytics event
export const trackEvent = (name: string, properties: Record<string, unknown> = {}, options: TrackOptions = {}) => {
  if (isDoNotTrackEnabled()) return;

  const eventProperties = { ...properties };

  // If offline or provider not ready, push to queue
  const isPHReq = !options.providers || options.providers.includes('posthog');
  const isGAReq = !options.providers || options.providers.includes('ga4');
  
  const phReady = !isPHReq || isProviderReady('posthog');
  const gaReady = !isGAReq || isProviderReady('ga4');

  if (!isOnline() || !phReady || !gaReady) {
    enqueue({
      type: 'event',
      name,
      properties: eventProperties,
      options,
    });
    return;
  }

  dispatchEventImmediately(name, eventProperties, options);
};

// Track Simulated Page View
export const trackPageView = (pageTitle: string, path: string, properties: Record<string, unknown> = {}) => {
  if (isDoNotTrackEnabled()) return;

  if (!isOnline() || !allProvidersReady()) {
    enqueue({
      type: 'page_view',
      pageTitle,
      path,
      properties,
    });
    return;
  }

  dispatchPageViewImmediately(pageTitle, path, properties);
};

// Set Global User Attributes
export const setUserProperties = (properties: Record<string, unknown>) => {
  if (isDoNotTrackEnabled()) return;

  if (!isOnline() || !allProvidersReady()) {
    enqueue({
      type: 'user_properties',
      properties,
    });
    return;
  }

  dispatchUserPropertiesImmediately(properties);
};

// Track errors
export const trackError = (error: Error, context: Record<string, unknown> = {}) => {
  trackEvent('error_occurred', {
    error_message: error.message,
    error_stack: error.stack || 'No stack trace available',
    error_source: context.source || 'unhandled',
    ...context,
  });
};

// Debounced search queries
const searchDebounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};
export const trackSearch = (scope: string, query: string) => {
  if (!query.trim()) return;

  if (searchDebounceTimers[scope]) {
    clearTimeout(searchDebounceTimers[scope]);
  }

  searchDebounceTimers[scope] = setTimeout(() => {
    trackEvent('search_used', {
      search_scope: scope,
      search_query_length: query.length, // anonymize query search text
    });
    delete searchDebounceTimers[scope];
  }, 1500); // 1.5 second debounce delay
};

// Web Vitals Metric logger
const setupWebVitals = () => {
  if (isDoNotTrackEnabled()) return;
  isWebVitalsEnabled = true;

  const logVital = (metricName: string, metric: Metric) => {
    trackEvent('performance_vital_report', {
      vital_name: metricName,
      vital_value: metric.value,
      vital_rating: metric.rating, // e.g. good, needs improvement, poor
      vital_delta: metric.delta,
    });
  };

  try {
    onLCP((m) => logVital('LCP', m));
    onFCP((m) => logVital('FCP', m));
    onCLS((m) => logVital('CLS', m));
    onINP((m) => logVital('INP', m));
    onTTFB((m) => logVital('TTFB', m));
  } catch (e) {
    console.error('📊 [Analytics] Failed to initialize web vitals:', e);
  }
};

// ─── Click tracking ──────────────────────────────────────────────────────────
// One delegated listener records every link/button click inside an element marked
// `data-track-scope` (the classic portfolio root) as a `ui_click` event. Elements can
// set `data-track="name"` for a stable label; otherwise aria-label/text is used.
export const describeClick = (target: Element | null) => {
  const el = target?.closest<HTMLElement>('a, button, [role="button"], [data-track]');
  if (!el) return null;
  const scope = el.closest<HTMLElement>('[data-track-scope]');
  if (!scope || el.closest('[data-track-ignore]')) return null;

  const rawLabel =
    el.dataset.track ||
    el.getAttribute('aria-label') ||
    el.textContent ||
    el.getAttribute('title') ||
    '';
  const href = el instanceof HTMLAnchorElement ? el.getAttribute('href') || '' : '';
  let outbound = false;
  if (href && /^https?:/i.test(href)) {
    try { outbound = new URL(href).host !== window.location.host; } catch { outbound = false; }
  }
  return {
    click_label: rawLabel.replace(/\s+/g, ' ').trim().slice(0, 80) || el.tagName.toLowerCase(),
    click_section:
      el.closest<HTMLElement>('section[id]')?.id ||
      (el.closest('nav') ? 'nav' : el.closest('footer') ? 'footer' : 'page'),
    click_scope: scope.dataset.trackScope || 'page',
    click_element: el.tagName.toLowerCase(),
    // Never send mailto/tel addresses — just the kind of link.
    link_type: href.startsWith('mailto:') ? 'email' : href.startsWith('tel:') ? 'phone' : href.startsWith('#') ? 'anchor' : href ? 'url' : 'none',
    link_url: href && /^https?:|^\//i.test(href) ? href.slice(0, 200) : undefined,
    outbound,
  };
};

const setupClickTracking = () => {
  if (typeof document === 'undefined') return;
  document.addEventListener('click', (event) => {
    const info = describeClick(event.target as Element | null);
    if (info) trackEvent('ui_click', info);
  }, { capture: true, passive: true });
};

// Setup Global Error Event Listeners
const setupGlobalErrorCatching = () => {
  if (typeof window === 'undefined') return;

  window.addEventListener('error', (event) => {
    trackError(event.error || new Error(event.message), {
      source: 'window_error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const err = reason instanceof Error ? reason : new Error(String(reason));
    trackError(err, { source: 'unhandled_rejection' });
  });
};

// Declare window types for gtag
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}
