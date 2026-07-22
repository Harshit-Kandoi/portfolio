import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  playBootSound,
  playWindowSound,
  playNotificationSound,
  playTerminalClick,
  playThemeSwitchSound,
  playVolumePreviewSound,
  playClickSound,
  playUnlockSound,
} from '../sounds';
import { useOSStore } from '../../store/useOSStore';

describe('Sound Utilities Tests', () => {
  beforeEach(() => {
    useOSStore.setState({ soundEnabled: true, volume: 0.5 });
  });

  it('should run sound functions without errors when sound is disabled', () => {
    useOSStore.setState({ soundEnabled: false });

    expect(() => {
      playBootSound();
      playWindowSound('open');
      playWindowSound('close');
      playWindowSound('minimize');
      playNotificationSound();
      playTerminalClick();
      playThemeSwitchSound();
      playVolumePreviewSound(0.8);
      playClickSound();
      playUnlockSound();
    }).not.toThrow();
  });

  it('should run sound functions gracefully when AudioContext is mocked', () => {
    const mockOsc = {
      type: 'sine',
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
    const mockGain = {
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };

    class MockAudioContext {
      state = 'running';
      currentTime = 0;
      destination = {};
      createOscillator() {
        return mockOsc;
      }
      createGain() {
        return mockGain;
      }
      resume() {
        return Promise.resolve();
      }
    }

    vi.stubGlobal('AudioContext', MockAudioContext);

    expect(() => {
      playBootSound();
      playWindowSound('open');
      playNotificationSound();
      playTerminalClick();
      playThemeSwitchSound();
      playVolumePreviewSound(0.5);
      playClickSound();
      playUnlockSound();
    }).not.toThrow();
  });
});
