import { describe, it, expect, beforeEach } from 'vitest';
import { describeClick } from '../analytics';

describe('describeClick', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div data-track-scope="classic">
        <nav><button id="nav-btn">Work</button></nav>
        <section id="hero">
          <a id="cta" href="#contact"><svg></svg><span>Contact   me</span></a>
          <a id="gh" href="https://github.com/Harshit-Kandoi" aria-label="GitHub profile">GH</a>
          <a id="mail" href="mailto:hello@harshitkandoi.in">Email</a>
          <button id="named" data-track="launch_os">Interactive mode</button>
          <div id="ignored" data-track-ignore><button id="inner">Hidden</button></div>
          <p id="text">Just text</p>
        </section>
      </div>
      <button id="outside">Outside</button>
    `;
  });

  const click = (id: string) => describeClick(document.getElementById(id));

  it('labels anchors by text and section', () => {
    expect(click('cta')).toMatchObject({ click_label: 'Contact me', click_section: 'hero', link_type: 'anchor', outbound: false });
  });

  it('resolves clicks on child elements to the link', () => {
    const svg = document.querySelector('#cta svg');
    expect(describeClick(svg)?.click_label).toBe('Contact me');
  });

  it('prefers data-track, then aria-label', () => {
    expect(click('named')?.click_label).toBe('launch_os');
    expect(click('gh')).toMatchObject({ click_label: 'GitHub profile', outbound: true, link_type: 'url' });
  });

  it('never sends email addresses', () => {
    const info = click('mail');
    expect(info?.link_type).toBe('email');
    expect(info?.link_url).toBeUndefined();
  });

  it('marks nav clicks and ignores out-of-scope or ignored elements', () => {
    expect(click('nav-btn')?.click_section).toBe('nav');
    expect(click('outside')).toBeNull();
    expect(click('inner')).toBeNull();
    expect(click('text')).toBeNull();
  });
});
