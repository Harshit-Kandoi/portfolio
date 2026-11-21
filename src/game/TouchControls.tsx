import TouchButton from './TouchButton';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { ArrowUp, Footprints } from 'lucide-react';
import { stickVector, type TouchInput } from './touchInput';

export default function TouchControls({ input }: { input: TouchInput }) {
  const stick = useRef<HTMLDivElement>(null);
  const pointer = useRef<number | null>(null);
  const [knob, setKnob] = useState({ x: 0, z: 0 });
  const [sprinting, setSprinting] = useState(false);
  useEffect(() => {
    const reset = () => { pointer.current = null; input.reset(); setKnob({ x: 0, z: 0 }); setSprinting(false); };
    window.addEventListener('resize', reset);
    return () => { window.removeEventListener('resize', reset); input.reset(); };
  }, [input]);
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (pointer.current !== event.pointerId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const vector = stickVector(event.clientX - rect.x - rect.width / 2, event.clientY - rect.y - rect.height / 2, rect.width * 0.35);
    input.x = vector.x; input.z = vector.z; setKnob(vector);
  };
  const stop = (event: PointerEvent<HTMLDivElement>) => {
    if (pointer.current !== event.pointerId) return;
    pointer.current = null; input.x = input.z = 0; setKnob({ x: 0, z: 0 });
  };
  return <div className="verse-touch-controls" aria-label="Touch game controls">
    <div ref={stick} className="verse-touch-stick" role="group" aria-label="Movement stick" onPointerDown={event => {
      if (pointer.current !== null) return;
      event.preventDefault(); pointer.current = event.pointerId; event.currentTarget.setPointerCapture(event.pointerId); move(event);
    }} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}>
      <span className="verse-stick-cross" aria-hidden="true"/>
      <span className="verse-stick-knob" style={{ transform: `translate(${knob.x * 28}px, ${knob.z * 28}px)` }} aria-hidden="true"><Footprints size={22}/></span>
      <span className="verse-stick-label">MOVE</span>
    </div>
    <div className="verse-touch-actions">
      <TouchButton aria-label="Sprint" aria-pressed={sprinting} onClick={() => { input.sprint = !sprinting; setSprinting(!sprinting); }}><Footprints size={20}/><span>Sprint</span></TouchButton>
      <TouchButton aria-label="Jump" onClick={() => { input.jump = true; }}><ArrowUp size={21}/><span>Jump</span></TouchButton>
    </div>
  </div>;
}
