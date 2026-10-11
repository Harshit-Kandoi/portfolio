// @vitest-environment jsdom
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProjectsApp from '../ProjectsApp';

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

describe('ProjectsApp Component Tests', () => {
  it('should render Projects application search input and category filters', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(<ProjectsApp />);
    });

    expect(container.textContent).toContain('Products & Software');
    expect(container.textContent).toContain('Categories');
    expect(container.querySelector('input[placeholder*="Search"]')).not.toBeNull();

    act(() => root.unmount());
  });
});
