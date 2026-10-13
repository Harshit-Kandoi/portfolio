import { useRef, type ButtonHTMLAttributes } from 'react';

let cancelClickGuard: (() => void) | undefined;
// A panel can appear under the released finger before Chromium sends its click.
// Consume that follow-up event even if it targets the new panel's close button.
function suppressFollowUpClick() {
  cancelClickGuard?.();
  const clear = () => {
    window.removeEventListener('click', click, true);
    window.removeEventListener('pointerdown', clear, true);
    window.removeEventListener('keydown', clear, true);
    cancelClickGuard = undefined;
  };
  const click = (event: MouseEvent) => {
    clear();
    if (event.detail > 0) { event.preventDefault(); event.stopImmediatePropagation(); }
  };
  cancelClickGuard = clear;
  window.addEventListener('click', click, true);
  window.addEventListener('pointerdown', clear, true);
  window.addEventListener('keydown', clear, true);
}

// A second finger must be able to jump or open a menu while the first holds the stick.
// A primary tap activates on release, including after a browser scroll gesture.
// Pointer cancellation keeps scrolling safe; keyboard and mouse still use click.
export default function TouchButton({ onClick, onPointerDown, onPointerUp, onPointerCancel, onLostPointerCapture, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const handled = useRef(new Set<number>());
  const pending = useRef(new Map<number, { x: number; y: number }>());
  return <button {...props} onPointerDown={event => {
    handled.current.delete(event.pointerId);
    onPointerDown?.(event);
    if (!props.disabled && !event.defaultPrevented && event.pointerType !== 'mouse') {
      if (event.isPrimary) pending.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      else { handled.current.add(event.pointerId); event.preventDefault(); onClick?.(event); }
    }
  }} onPointerUp={event => {
    onPointerUp?.(event);
    const start = pending.current.get(event.pointerId); pending.current.delete(event.pointerId);
    if (!props.disabled && !event.defaultPrevented && start && Math.hypot(event.clientX - start.x, event.clientY - start.y) <= 10) {
      event.preventDefault(); suppressFollowUpClick(); onClick?.(event);
    }
  }} onPointerCancel={event => {
    pending.current.delete(event.pointerId); onPointerCancel?.(event);
  }} onLostPointerCapture={event => {
    pending.current.delete(event.pointerId); onLostPointerCapture?.(event);
  }} onClick={event => {
    const pointer = event.nativeEvent as PointerEvent;
    if (handled.current.delete(pointer.pointerId)) return;
    onClick?.(event);
  }}/>;
}
