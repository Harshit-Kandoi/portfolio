// @vitest-environment jsdom
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MarketplaceApp from '../MarketplaceApp';

beforeEach(() => {
  if (typeof window.matchMedia !== 'function') {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  }
});

describe('MarketplaceApp Component Tests', () => {
  it('should render Marketplace app header and category filters', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(<MarketplaceApp />);
    });

    expect(container.textContent).toContain('Store.exe');
    expect(container.textContent).toContain('Dev Marketplace');
    expect(container.textContent).toContain('Templates');

    act(() => root.unmount());
  });
});
