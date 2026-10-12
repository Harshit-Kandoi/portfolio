import { useRef, type ButtonHTMLAttributes } from 'react';

// A second finger must be able to jump or open a menu while the first holds the stick.
// Primary taps keep normal click/scroll behavior; keyboard and mouse clicks are unchanged.
export default function TouchButton({ onClick, onPointerDown, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const handled = useRef(new Set<number>());
  return <button {...props} onPointerDown={event => {
    handled.current.delete(event.pointerId);
    onPointerDown?.(event);
    if (!event.defaultPrevented && event.pointerType !== 'mouse' && !event.isPrimary) {
      handled.current.add(event.pointerId); event.preventDefault(); onClick?.(event);
    }
  }} onClick={event => {
    const pointer = event.nativeEvent as PointerEvent;
    if (handled.current.delete(pointer.pointerId)) return;
    onClick?.(event);
  }}/>;
}
