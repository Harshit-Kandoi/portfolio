// ─── System Uptime & Utilities ───────────────────────────────────────────────
// Records when the website session was initialized in the browser.

const SYSTEM_INIT_TIME: number = (function () {
  // Check if session start time is stored in sessionStorage for page refreshes within tab
  try {
    const stored = sessionStorage.getItem('portfolio_system_init_time');
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    const now = Date.now();
    sessionStorage.setItem('portfolio_system_init_time', now.toString());
    return now;
  } catch {
    return Date.now();
  }
})();

export function getSystemInitTime(): number {
  return SYSTEM_INIT_TIME;
}

export function getSystemUptimeSeconds(): number {
  return Math.max(0, Math.floor((Date.now() - SYSTEM_INIT_TIME) / 1000));
}

/**
 * Format uptime as HH:MM:SS
 */
export function formatUptimeHHMMSS(totalSeconds?: number): string {
  const seconds = totalSeconds ?? getSystemUptimeSeconds();
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

/**
 * Format uptime as human readable string (e.g. "1h 14m 22s" or "4m 12s")
 */
export function formatUptimeHuman(totalSeconds?: number): string {
  const seconds = totalSeconds ?? getSystemUptimeSeconds();
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (hrs > 0) parts.push(`${hrs}h`);
  parts.push(`${mins}m`);
  parts.push(`${secs}s`);
  return parts.join(' ');
}
