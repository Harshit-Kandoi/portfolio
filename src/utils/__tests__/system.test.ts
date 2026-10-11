import { describe, it, expect } from 'vitest';
import {
  getSystemUptimeSeconds,
  formatUptimeHHMMSS,
  formatUptimeHuman,
} from '../system';

describe('System Utilities Tests', () => {
  it('should calculate system uptime in seconds', () => {
    const uptime = getSystemUptimeSeconds();
    expect(typeof uptime).toBe('number');
    expect(uptime).toBeGreaterThanOrEqual(0);
  });

  it('should format seconds into HH:MM:SS format correctly', () => {
    expect(formatUptimeHHMMSS(0)).toBe('00:00:00');
    expect(formatUptimeHHMMSS(65)).toBe('00:01:05');
    expect(formatUptimeHHMMSS(3665)).toBe('01:01:05');
  });

  it('should format seconds into human readable duration strings', () => {
    expect(formatUptimeHuman(45)).toBe('0m 45s');
    expect(formatUptimeHuman(125)).toBe('2m 5s');
    expect(formatUptimeHuman(3665)).toBe('1h 1m 5s');
  });
});
