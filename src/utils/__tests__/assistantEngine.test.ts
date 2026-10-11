import { describe, it, expect } from 'vitest';
import { answer, tokenize } from '../assistantEngine';
import { PORTFOLIO_META } from '../../data/config';

describe('assistantEngine', () => {
  it('tokenizes with word boundaries and keeps tech punctuation', () => {
    expect(tokenize("Harshit's Node.js + C++ skills?")).toEqual(['harshit', 'node.js', 'c++', 'skills']);
  });

  it('answers who/summary questions from config', () => {
    const r = answer('Tell me about Harshit');
    expect(r.intent).toBe('about');
    expect(r.text).toContain(PORTFOLIO_META.role);
    expect(r.text).toContain(PORTFOLIO_META.company);
  });

  it('answers current role', () => {
    const r = answer('What does he do now?');
    expect(r.intent).toBe('current_role');
    expect(r.text).toContain(PORTFOLIO_META.company);
  });

  it('does not treat "control" as a role question', () => {
    expect(answer('how do I control the windows?').intent).not.toBe('current_role');
  });

  it('distinguishes Java from JavaScript', () => {
    const java = answer('Does he know Java?');
    expect(java.intent).toBe('skill_query');
    expect(java.text).toContain('Java');
    expect(java.text).not.toContain('JavaScript');

    const js = answer('Does he know JavaScript?');
    expect(js.intent).toBe('skill_query');
    expect(js.text).toContain('JavaScript');
  });

  it('lists projects by technology', () => {
    const r = answer('Show Python projects');
    expect(r.intent).toBe('projects_by_tech');
    expect(r.actions).toContainEqual(expect.objectContaining({ type: 'open', target: 'projects' }));
  });

  it('describes a specific project by name and never links private source', () => {
    expect(answer('Tell me about Financial Mirror').intent).toBe('project_detail');
    const cc = answer('tell me about clearcue-ai');
    expect(cc.intent).toBe('project_detail');
    expect(cc.actions.some((a) => a.type === 'link' && a.url.includes('github.com'))).toBe(false);
  });

  it('handles hire/freelance without claiming open to work', () => {
    const r = answer('Is he open to work?');
    expect(r.intent).toBe('hire');
    expect(r.text).toContain(PORTFOLIO_META.availability.toLowerCase());
    expect(r.text).toMatch(/full-time/);
  });

  it('opens apps through suggestion actions', () => {
    const r = answer('play snake');
    expect(r.intent).toBe('open_app');
    expect(r.actions[0]).toMatchObject({ type: 'open', target: 'arcade' });
  });

  it('falls back with example questions', () => {
    const r = answer('qwerty zxcv');
    expect(r.intent).toBe('fallback');
    expect(r.text).toMatch(/Try:/);
  });
});
