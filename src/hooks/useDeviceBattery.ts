import { useEffect, useState } from 'react';

interface BatteryManagerLike extends EventTarget {
  level: number;
  charging: boolean;
}

/** Real device battery via the (Chromium-only) Battery Status API. Returns null when unsupported. */
export function useDeviceBattery() {
  const [battery, setBattery] = useState<{ level: number; charging: boolean } | null>(null);

  useEffect(() => {
    const nav = navigator as Navigator & { getBattery?: () => Promise<BatteryManagerLike> };
    if (typeof nav.getBattery !== 'function') return;
    let manager: BatteryManagerLike | null = null;
    let cancelled = false;
    const update = () => {
      if (manager && !cancelled) {
        setBattery({ level: Math.round(manager.level * 100), charging: manager.charging });
      }
    };
    nav.getBattery().then((m) => {
      if (cancelled) return;
      manager = m;
      update();
      m.addEventListener('levelchange', update);
      m.addEventListener('chargingchange', update);
    }).catch(() => { /* API blocked (e.g. permissions policy) — keep hidden */ });
    return () => {
      cancelled = true;
      manager?.removeEventListener('levelchange', update);
      manager?.removeEventListener('chargingchange', update);
    };
  }, []);

  return battery;
}
