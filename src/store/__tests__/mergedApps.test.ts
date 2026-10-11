import { describe, it, expect, beforeEach } from 'vitest';
import { useOSStore } from '../useOSStore';

describe('merged app aliases', () => {
  beforeEach(() => {
    const store = useOSStore.getState();
    store.closeAllWindows();
    store.clearMobileRecents();
    store.setViewMode('desktop');
    store.setIsSimulatingMobile(false);
  });

  it.each([
    ['snake', 'arcade', 'snake'],
    ['gaming', 'arcade', 'rpg'],
    ['blog', 'writing', 'blog'],
    ['notes', 'writing', 'notes'],
  ])('openWindow(%s) opens %s on the %s tab', (legacyId, app, tab) => {
    useOSStore.getState().openWindow(legacyId, true);
    const state = useOSStore.getState();
    expect(state.windows.find((w) => w.id === app)?.isOpen).toBe(true);
    expect(state.windows.some((w) => w.id === legacyId)).toBe(false);
    expect(state.appTabs[app]).toBe(tab);
  });

  it('maps legacy ids on mobile too', () => {
    useOSStore.getState().setViewMode('mobile');
    useOSStore.getState().openMobileApp('snake');
    const state = useOSStore.getState();
    expect(state.activeMobileApp).toBe('arcade');
    expect(state.appTabs.arcade).toBe('snake');
  });
});
