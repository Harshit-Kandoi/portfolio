import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TouchButton from '../TouchButton';

describe('game buttons with simultaneous touch input', () => {
  let container: HTMLDivElement, root: Root, button: HTMLButtonElement;
  const activate = vi.fn();
  beforeEach(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    activate.mockClear(); container = document.createElement('div'); document.body.appendChild(container);
    root = createRoot(container); act(() => root.render(<TouchButton onClick={activate}>Jump</TouchButton>));
    button = container.querySelector('button')!;
  });
  afterEach(() => { act(() => root.unmount()); container.remove(); });
  const dispatch = (type: string, id: number, primary: boolean) => {
    const event = Object.assign(new MouseEvent(type, { bubbles: true, cancelable: true, detail: 1 }), { pointerType: 'touch', pointerId: id, isPrimary: primary });
    act(() => { button.dispatchEvent(event); }); return event;
  };
  it('preserves normal primary taps so scrolling can start over a button', () => {
    expect(dispatch('pointerdown', 5, true).defaultPrevented).toBe(false);
    expect(activate).not.toHaveBeenCalled();
    dispatch('click', 5, false);
    expect(activate).toHaveBeenCalledTimes(1);
  });
  it('activates a second finger immediately and ignores its compatibility click', () => {
    expect(dispatch('pointerdown', 6, false).defaultPrevented).toBe(true);
    expect(activate).toHaveBeenCalledTimes(1);
    dispatch('click', 6, false);
    expect(activate).toHaveBeenCalledTimes(1);
  });
  it('keeps keyboard and mouse clicks working after a touch without a compatibility click', () => {
    dispatch('pointerdown', 8, false);
    act(() => button.click());
    expect(activate).toHaveBeenCalledTimes(2);
  });
});
