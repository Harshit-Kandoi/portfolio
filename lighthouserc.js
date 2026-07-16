export default {
  ci: {
    collect: {
      staticDistDir: "./dist",
      numberOfRuns: 1,
      settings: {
        preset: "desktop",
      },
    },
    assert: {
      // Use the least-strict preset as the base, then override below
      preset: "lighthouse:no-pwa",
      assertions: {
        // ── Completely disabled: not fixable without breaking the app ────
        // Canvas-based wallpaper — no real raster images to optimize
        "image-delivery-insight": "off",
        "uses-optimized-images": "off",

        // Dynamic SPA — request chains are expected
        "network-dependency-tree-insight": "off",
        "critical-request-chains": "off",

        // Tailwind CSS — PurgeCSS can't eliminate all utility classes at build time
        "unused-css-rules": "off",

        // Vite lazy-split chunks — some JS is loaded on demand
        "unused-javascript": "off",

        // Google Fonts already uses preload + media=print async trick
        "render-blocking-resources": "off",
        "render-blocking-insight": "off",

        // PWA rules not applicable to this portfolio
        "installable-manifest": "off",
        "service-worker": "off",
        "splash-screen": "off",
        "themed-omnibox": "off",
        "content-width": "off",
        "without-javascript": "off",

        // ── Accessibility: hard failures ─────────────────────────────────
        "meta-viewport": ["error", { minScore: 1 }],
        "document-title": ["error", { minScore: 1 }],
        "html-has-lang": ["error", { minScore: 1 }],
        "meta-description": ["error", { minScore: 1 }],

        // ── Category score targets ────────────────────────────────────────
        "categories:performance":    ["warn",  { minScore: 0.75 }],
        "categories:accessibility":  ["error", { minScore: 0.9  }],
        "categories:best-practices": ["warn",  { minScore: 0.8  }],
        "categories:seo":            ["error", { minScore: 0.9  }],

        // ── Core Web Vitals ───────────────────────────────────────────────
        "first-contentful-paint":  ["warn", { minScore: 0.75 }],
        "speed-index":             ["warn", { minScore: 0.75 }],
        "largest-contentful-paint":["warn", { minScore: 0.75 }],
        "total-blocking-time":     ["warn", { minScore: 0.75 }],
        "cumulative-layout-shift": ["warn", { minScore: 0.9  }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
