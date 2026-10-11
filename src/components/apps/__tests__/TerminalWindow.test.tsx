// @vitest-environment jsdom
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TerminalWindow from '../TerminalWindow';
import { APP_VERSION } from '../../../data/config';

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

    expect(container.textContent).toContain(`Welcome to Harshit-OS v${APP_VERSION} Terminal`);
    expect(container.querySelector('input')).not.toBeNull();

    act(() => root.unmount());
  });

  it('runs help and experience commands', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => {
      root.render(<TerminalWindow />);
    });

    const run = (cmd: string) => {
      const input = container.querySelector('input') as HTMLInputElement;
      const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      act(() => {
        setValue.call(input, cmd);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });
      act(() => {
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      });
    };

    run('help');
    expect(container.textContent).toContain('work timeline');
    run('experience');
    expect(container.textContent).toContain('Associate Software Engineer');
    expect(container.textContent).toContain('Aug 2025 - Present');

    act(() => root.unmount());
  });
});
