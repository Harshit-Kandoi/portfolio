import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import Panels from '../Panels';
import { useGame } from '../store';
import { experience } from '../../data/experience';
import { skills } from '../../data/skills';

describe('portfolio panels', () => {
  let container: HTMLDivElement, root: Root, opener: HTMLButtonElement;
  beforeEach(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    useGame.setState({ panel: null, playing: true });
    opener = document.createElement('button'); document.body.appendChild(opener); opener.focus();
    container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
    act(() => root.render(<Panels snapshot={{ x: 0, z: 13, y: 0, region: 'hub', near: null, fps: 60, locked: false }} onClassic={() => {}}/>));
  });
  afterEach(() => { act(() => root.unmount()); container.remove(); opener.remove(); useGame.setState({ panel: null, playing: false }); });
  const open = (panel: 'settings' | 'career' | null) => act(() => useGame.getState().open(panel));
  const click = (name: string) => {
    const button = [...container.querySelectorAll('button')].find(button => button.textContent?.startsWith(name) || button.getAttribute('aria-label') === name);
    expect(button).toBeDefined(); act(() => button!.click());
  };
  it('ignores repeated Escape in an open panel, then closes on a fresh press and restores focus', () => {
    open('settings'); expect(document.activeElement).toBe(container.querySelector('[role="dialog"]'));
    act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', repeat: true, bubbles: true })));
    expect(useGame.getState().panel).toBe('settings');
    act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    expect(useGame.getState().panel).toBeNull(); expect(document.activeElement).toBe(opener);
  });
  it('closes settings through every button without changing the playing session', () => {
    for (const name of ['Close panel', 'Continue exploring', 'Close']) {
      open('settings'); click(name);
      expect(container.querySelector('[role="dialog"]')).toBeNull(); expect(useGame.getState().playing).toBe(true);
    }
    open('settings'); click('Return to lobby');
    expect(useGame.getState().playing).toBe(false); expect(useGame.getState().panel).toBeNull();
  });
  it('classifies the existing career records and preserves full descriptions, credentials and skills', () => {
    open('career');
    for (const [label, type] of [['All', null], ['Work Experience', 'work'], ['Education', 'education'], ['Certifications', 'Course']] as const) {
      click(label);
      const expected = experience.filter(entry => type === null || entry.type === type);
      const records = [...container.querySelectorAll('.verse-timeline article')];
      expect(records.map(record => record.querySelector('h3')!.textContent)).toEqual(expected.map(entry => entry.role || entry.title));
      records.forEach((record, index) => {
        const entry = expected[index];
        for (const description of Array.isArray(entry.description) ? entry.description : [entry.description]) expect(record.textContent).toContain(description);
        expect(record.querySelector('a')?.getAttribute('href')).toBe(entry.link);
      });
      expect(container.querySelectorAll('.verse-career-views [aria-pressed="true"]')).toHaveLength(1);
      expect(container.querySelectorAll('.verse-skill-library .verse-tags span')).toHaveLength(skills.length);
    }
    open(null); open('career');
    expect(container.querySelectorAll('.verse-timeline article')).toHaveLength(experience.length);
    expect(container.querySelector('.verse-career-views [aria-pressed="true"]')?.textContent).toMatch(/^All/);
  });
});
