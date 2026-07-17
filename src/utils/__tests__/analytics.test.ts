import { vi, describe, it, expect, beforeEach } from 'vitest';

const { mockInit, mockCapture, mockSetPersonProperties } = vi.hoisted(() => {
  return {
    mockInit: vi.fn((_key, config) => {
      if (config && config.loaded) {
        config.loaded();
      }
    }),
    mockCapture: vi.fn(),
    mockSetPersonProperties: vi.fn(),
  };
});

vi.mock('posthog-js', () => {
  return {
    default: {
      init: mockInit,
      capture: mockCapture,
      setPersonProperties: mockSetPersonProperties,
    },
  };
});

vi.mock('web-vitals', () => {
  return {
    onLCP: vi.fn(),
    onFCP: vi.fn(),
    onCLS: vi.fn(),
    onINP: vi.fn(),
    onTTFB: vi.fn(),
  };
});

describe('Centralized Analytics Service Tests', () => {
  let analytics: typeof import('../analytics');

  const triggerScriptOnload = () => {
    if (typeof document === 'undefined') return;
    const scripts = document.head.getElementsByTagName('script');
    for (const s of Array.from(scripts)) {
      if (s.onload) {
        (s.onload as (ev: Event) => void)(new Event('load'));
      }
    }
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    // Clear document head scripts
    if (typeof document !== 'undefined') {
      document.head.innerHTML = '';
    }

    // Clear global window variables
    if (typeof window !== 'undefined') {
      delete (window as any).gtag;
      delete (window as any).dataLayer;
    }
    
    // Reset DNT status on navigator/window
    Object.defineProperty(navigator, 'doNotTrack', {
      value: undefined,
      configurable: true,
    });
    if (typeof window !== 'undefined') {
      Object.defineProperty(window, 'doNotTrack', {
        value: undefined,
        configurable: true,
      });
    }

    // Default env variables
    import.meta.env.VITE_GA_MEASUREMENT_ID = 'G-TEST123';
    import.meta.env.VITE_POSTHOG_KEY = 'phc_test123';

    // Dynamically load the module to get fresh state for each test
    analytics = await import('../analytics');
  });

  describe('DNT (Do Not Track) checks', () => {
    it('should detect when DNT is disabled by default', () => {
      expect(analytics.isDoNotTrackEnabled()).toBe(false);
    });

    it('should detect when DNT is enabled via navigator.doNotTrack', () => {
      Object.defineProperty(navigator, 'doNotTrack', {
        value: '1',
        configurable: true,
      });
      expect(analytics.isDoNotTrackEnabled()).toBe(true);
    });

    it('should detect when DNT is enabled via window.doNotTrack', () => {
      Object.defineProperty(window, 'doNotTrack', {
        value: 'yes',
        configurable: true,
      });
      expect(analytics.isDoNotTrackEnabled()).toBe(true);
    });
  });

  describe('Initialization and Script Load', () => {
    it('should initialize PostHog and GA4 when keys are present and DNT is disabled', () => {
      analytics.initAnalytics();
      triggerScriptOnload();

      expect(window.gtag).toBeDefined();
      expect(window.dataLayer).toBeDefined();
      expect(mockInit).toHaveBeenCalled();
    });

    it('should NOT initialize GA4 or PostHog if DNT is active', () => {
      Object.defineProperty(navigator, 'doNotTrack', {
        value: '1',
        configurable: true,
      });

      analytics.initAnalytics();
      triggerScriptOnload();

      expect(window.gtag).toBeUndefined();
    });
  });

  describe('Event Tracking & Queueing', () => {
    it('should queue events before initialization and flush after ready', () => {
      // Track an event before calling init
      analytics.trackEvent('resume_download', { format: 'pdf' });
      expect(mockCapture).not.toHaveBeenCalled();

      // Initialize analytics and trigger script load
      analytics.initAnalytics();
      triggerScriptOnload();

      expect(mockCapture).toHaveBeenCalledWith(
        'resume_download',
        expect.objectContaining({
          format: 'pdf',
          session_id: expect.stringContaining('sess_'),
          visit_number: expect.any(Number),
        })
      );
    });

    it('should track page_view immediately if initialized', () => {
      analytics.initAnalytics();
      triggerScriptOnload();
      
      analytics.trackPageView('About App', '/apps/about');

      expect(mockCapture).toHaveBeenCalledWith(
        '$pageview',
        expect.objectContaining({
          $pathname: '/apps/about',
          $title: 'About App',
        })
      );
    });

    it('should update user properties', () => {
      analytics.initAnalytics();
      triggerScriptOnload();
      
      analytics.setUserProperties({ role: 'recruiter' });

      expect(mockSetPersonProperties).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'recruiter',
        })
      );
    });
  });

  describe('Anonymized Search Debouncing', () => {
    it('should debounce search queries and log only the length and scope', async () => {
      vi.useFakeTimers();

      analytics.initAnalytics();
      triggerScriptOnload();

      analytics.trackSearch('projects', 'react');
      analytics.trackSearch('projects', 'react native');

      // Verify no immediate track event
      expect(mockCapture).not.toHaveBeenCalled();

      // Fast-forward time to fire debounce callback
      vi.advanceTimersByTime(1500);

      expect(mockCapture).toHaveBeenCalledWith(
        'search_used',
        expect.objectContaining({
          search_scope: 'projects',
          search_query_length: 12,
        })
      );

      vi.useRealTimers();
    });
  });
});
