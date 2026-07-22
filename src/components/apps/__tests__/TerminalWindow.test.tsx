// @vitest-environment jsdom
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TerminalWindow from '../TerminalWindow';

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

describe('TerminalWindow Component Tests', () => {
  it('should render initial terminal greeting and prompt input', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(<TerminalWindow />);
    });

    expect(container.textContent).toContain('Welcome to Harshit-OS v2.0.0 Terminal');
    expect(container.querySelector('input')).not.toBeNull();

    act(() => root.unmount());
  });
});
