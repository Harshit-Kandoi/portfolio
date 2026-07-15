import { useEffect } from 'react';
import { useOSStore } from '../store/useOSStore';

/**
 * Custom hook to lock the window scroll coordinates strictly to (0,0),
 * override default browser scroll restoration, and prevent visual jumps
 * during routing or layout shifts.
 */
export function useScrollLock() {
  const activeMobileApp = useOSStore((state) => state.activeMobileApp);
  const viewMode = useOSStore((state) => state.viewMode);

  useEffect(() => {
    // 1. Force browser scroll restoration behavior to 'manual'
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // 2. Add an event listener to actively intercept and snap any window-level scroll back to (0,0)
    const handleScroll = () => {
      if (window.scrollY !== 0 || window.scrollX !== 0) {
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Snap to (0,0) immediately upon initialization
    window.scrollTo(0, 0);
    if (document.body) document.body.scrollTop = 0;
    if (document.documentElement) document.documentElement.scrollTop = 0;

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 3. Force scroll reset on any routing/app switches
  useEffect(() => {
    window.scrollTo(0, 0);
    if (document.body) document.body.scrollTop = 0;
    if (document.documentElement) document.documentElement.scrollTop = 0;
  }, [activeMobileApp, viewMode]);
}
