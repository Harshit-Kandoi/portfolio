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
  const dispatch = (type: string, id: number, primary: boolean, clientX = 0) => {
    const event = Object.assign(new MouseEvent(type, { bubbles: true, cancelable: true, detail: 1, clientX }), { pointerType: 'touch', pointerId: id, isPrimary: primary });
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
  it('activates a primary tap on release when a browser omits click, without doubling a later click', () => {
    dispatch('pointerdown', 10, true); dispatch('pointerup', 10, true);
    expect(activate).toHaveBeenCalledTimes(1);
    dispatch('click', 10, false);
    expect(activate).toHaveBeenCalledTimes(1);
  });
  it('does not activate for a swipe or a cancelled scrolling pointer', () => {
    dispatch('pointerdown', 11, true); dispatch('pointerup', 11, true, 35);
    dispatch('pointerdown', 12, true); dispatch('pointercancel', 12, true); dispatch('pointerup', 12, true);
    expect(activate).not.toHaveBeenCalled();
  });
  it('ignores a compatibility click retargeted to a newly opened panel, then allows fresh input', () => {
    const close = document.createElement('button'), dismiss = vi.fn();
    close.addEventListener('click', dismiss); container.appendChild(close);
    dispatch('pointerdown', 13, true); dispatch('pointerup', 13, true);
    close.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }));
    expect(dismiss).not.toHaveBeenCalled();
    close.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true })); close.click();
    expect(dismiss).toHaveBeenCalledTimes(1);
  });
  it('keeps keyboard and mouse clicks working after a touch without a compatibility click', () => {
    dispatch('pointerdown', 8, false);
    act(() => button.click());
    expect(activate).toHaveBeenCalledTimes(2);
  });
});
