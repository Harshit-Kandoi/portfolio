// @vitest-environment jsdom
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { describe, it, expect, vi } from 'vitest';
import ErrorBoundary from '../ErrorBoundary';

const ProblemChild = () => {
  throw new Error('Test crash inside component');
};

describe('ErrorBoundary Component Tests', () => {
  it('should render children when no error is thrown', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        <ErrorBoundary>
          <div id="test-child">Normal Component</div>
        </ErrorBoundary>
      );
    });

    expect(container.querySelector('#test-child')?.textContent).toBe('Normal Component');
    act(() => root.unmount());
  });

  it('should catch runtime errors and render fallback UI', () => {
    // Suppress console.error output during deliberate crash test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        <ErrorBoundary fallback={<div id="custom-fallback">Custom Fallback UI</div>}>
          <ProblemChild />
        </ErrorBoundary>
      );
    });

    expect(container.querySelector('#custom-fallback')?.textContent).toBe('Custom Fallback UI');

    act(() => root.unmount());
    consoleSpy.mockRestore();
  });
});
