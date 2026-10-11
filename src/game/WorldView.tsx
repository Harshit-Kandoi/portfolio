import { useEffect, useRef } from 'react';
import { createEngine, type WorldSnapshot } from './Engine';
interface Props { onSnapshot: (s: WorldSnapshot) => void; onReady: () => void; onError: (message: string) => void }
export default function WorldView({ onSnapshot, onReady, onError }: Props) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!host.current) return;
    let dispose: (() => void) | undefined;
    try { dispose = createEngine(host.current, onSnapshot, onError); onReady(); } catch { onError('Your browser could not start WebGL. All portfolio content is still available directly.'); }
    return () => dispose?.();
  }, [onSnapshot, onReady, onError]);
  return <div className="verse-world" ref={host} />;
}
