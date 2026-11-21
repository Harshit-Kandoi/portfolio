import { describe, expect, it } from 'vitest';
import { engineeringRecords, skillGroups } from '../content';
import { skills } from '../../data/skills';

describe('engineering exhibits', () => {
  it('includes professional cloud work, deployment experience and earned credentials', () => {
    const entries = engineeringRecords('cloud');
    expect(entries.some(entry => entry.role === 'Associate Software Engineer')).toBe(true);
    expect(entries.some(entry => entry.role === 'Software Engineer Intern')).toBe(true);
    expect(entries.some(entry => entry.title === 'Google Associate Cloud Engineer (ACE)' && entry.link)).toBe(true);
    expect(entries.some(entry => entry.title === 'Docker Foundations Professional Certificate')).toBe(true);
  });
  it('includes AI work and the current AI/ML education rather than only project cards', () => {
    const entries = engineeringRecords('ai');
    expect(entries.some(entry => entry.role === 'AI Intern (Computer Vision)')).toBe(true);
    expect(entries.some(entry => entry.role?.startsWith('M.Tech.'))).toBe(true);
    expect(entries.some(entry => entry.title === 'Machine Learning A-Z')).toBe(true);
  });
  it('retains every existing skill exactly once in the complete library', () => {
    expect(skillGroups.flatMap(group => group.skills)).toHaveLength(skills.length);
    expect(new Set(skillGroups.flatMap(group => group.skills))).toEqual(new Set(skills));
  });
});
