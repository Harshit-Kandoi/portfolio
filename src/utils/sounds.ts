import { useOSStore } from '../store/useOSStore';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

function playTone(frequency: number, type: OscillatorType, duration: number, gainValue: number = 0.1) {
  const store = useOSStore.getState();
  if (!store.soundEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume context if suspended (browser security autoplays)
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  try {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(gainValue * store.volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (err) {
    console.warn('Audio play failed:', err);
  }
}

export const playBootSound = () => {
  const store = useOSStore.getState();
  if (!store.soundEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  // Play a retro synth major chord sequence
  const now = ctx.currentTime;
  const playNote = (freq: number, startDelay: number, dur: number) => {
    try {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + startDelay);
      gainNode.gain.setValueAtTime(0.08 * store.volume, now + startDelay);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + startDelay + dur);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(now + startDelay);
      osc.stop(now + startDelay + dur);
    } catch {
      void 0;
    }
  };

  playNote(261.63, 0, 0.4); // C4
  playNote(329.63, 0.1, 0.4); // E4
  playNote(392.00, 0.2, 0.4); // G4
  playNote(523.25, 0.3, 0.8); // C5
};

export const playWindowSound = (action: 'open' | 'close' | 'minimize') => {
  if (action === 'open') {
    playTone(440, 'triangle', 0.15, 0.08); // A4
    setTimeout(() => playTone(880, 'triangle', 0.15, 0.08), 80); // A5
  } else if (action === 'close') {
    playTone(880, 'triangle', 0.15, 0.08);
    setTimeout(() => playTone(440, 'triangle', 0.15, 0.08), 80);
  } else {
    playTone(330, 'sine', 0.2, 0.08); // E4 slide down
  }
};

export const playNotificationSound = () => {
  playTone(523.25, 'sine', 0.1, 0.1); // C5
  setTimeout(() => playTone(659.25, 'sine', 0.1, 0.1), 60); // E5
  setTimeout(() => playTone(783.99, 'sine', 0.2, 0.1), 120); // G5
};

export const playTerminalClick = () => {
  // Ultra short high pass click
  playTone(1200, 'triangle', 0.03, 0.03);
};

export const playThemeSwitchSound = () => {
  playTone(600, 'sawtooth', 0.1, 0.05);
  setTimeout(() => playTone(300, 'sawtooth', 0.15, 0.05), 50);
};
