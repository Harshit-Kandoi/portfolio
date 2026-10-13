import TouchButton from './TouchButton';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, ChevronLeft, FileText, Github, Mail, Linkedin, X, MapPin, Volume2, Footprints } from 'lucide-react';
import { projects } from '../data/projects';
import { experience } from '../data/experience';
import { blogPosts } from '../data/blogs';
import { PORTFOLIO_META } from '../data/config';
import { resumeLink } from '../data/navigation';
import { resolveAsset } from '../utils/paths';
import type { Project } from '../types';
import { useGame, type Panel } from './store';
import { missionObjectives, zones } from './world';
import type { WorldSnapshot } from './Engine';
import WorldMap from './WorldMap';
import ZoneIcon from './ZoneIcon';
import useTouchDevice from './useTouchDevice';
import { engineeringRecords, skillGroups } from './content';
import type { ExperienceItem } from '../types';

const titles: Record<Exclude<Panel, null>, string> = { hub: 'Welcome, explorer.', projects: 'Project District', cloud: 'Cloud Citadel', career: 'Career Guild', ai: 'AI Nexus', knowledge: 'Knowledge Tavern', signal: 'Contact Beacon', guide: 'A little guidance.', map: 'Your next destination.', places: 'Pick a place.', missions: 'The explorer’s journal.', settings: 'Take a moment.', help: 'Make yourself at home.' };
export default function Panels({ snapshot, onClassic }: { snapshot: WorldSnapshot; onClassic: () => void }) {
  const panel = useGame(s => s.panel); const open = useGame(s => s.open); const dialog = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Project | null>(null);
  useEffect(() => {
    setSelected(null); if (!panel) return;
    if (panel === 'guide') useGame.getState().mark('guide');
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); open(null); }
      if (event.key !== 'Tab') return;
      const elements = [...(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input,select,[tabindex="0"]') ?? [])];
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', trap, true);
    return () => { document.removeEventListener('keydown', trap, true); if (previous?.isConnected) previous.focus(); else document.querySelector<HTMLCanvasElement>('.verse-world canvas')?.focus(); };
  }, [panel, open]);
  if (!panel) return null;
  const inspect = (p: Project) => { setSelected(p); useGame.getState().mark('inspect'); };
  const filtered = panel === 'cloud' ? projects.filter(p => p.category.includes('Cloud & Backend')) : panel === 'ai' ? projects.filter(p => p.category.includes('AI & Machine Learning')) : projects;
  return <div className="verse-panel-scrim" onPointerDown={e => { if (e.target === e.currentTarget) open(null); }}>
    <div ref={dialog} className={`verse-panel ${panel === 'map' ? 'verse-map-panel' : ''}`} role="dialog" aria-modal="true" aria-labelledby="verse-panel-title" tabIndex={-1}>
      <header className="verse-panel-header"><div><p className="verse-eyebrow">HARSHITVERSE / {panel === 'settings' ? 'PAUSE MENU' : 'DISCOVER'}</p><h2 id="verse-panel-title">{selected?.title ?? titles[panel]}</h2></div><TouchButton className="verse-icon-button" onClick={() => open(null)} aria-label="Close panel"><X size={21}/></TouchButton></header>
      <div className="verse-panel-body">
        {selected ? <>
          <TouchButton className="verse-text-button" onClick={() => setSelected(null)}><ChevronLeft size={16}/> All projects</TouchButton>
          <img className="verse-project-cover" src={resolveAsset(selected.image)} alt={`${selected.title} preview`} />
          <p className="verse-body-copy">{selected.description}</p><div className="verse-tags">{selected.technologies.map(t => <span key={t}>{t}</span>)}</div>
          <div className="verse-project-meta"><span>{selected.status}</span><span>{selected.duration}</span></div>
          <div className="verse-actions">{selected.demo && <a className="verse-primary" href={selected.demo} target="_blank" rel="noopener noreferrer">Open project <ArrowUpRight size={17}/></a>}{selected.github && <a className="verse-secondary" href={selected.github} target="_blank" rel="noopener noreferrer"><Github size={17}/> Source code</a>}</div>
        </> : <>
          {(panel === 'projects' || panel === 'cloud' || panel === 'ai') && <>
            <p className="verse-body-copy">{panel === 'cloud' ? 'Backend services, local cloud environments, and the tools behind reliable workflows.' : panel === 'ai' ? 'Computer vision, machine learning, and products built around practical AI.' : 'A collection of products, experiments, and things learned along the way. Pick a project to take a closer look.'}</p>
            {panel === 'cloud' && <><h3 className="verse-section-title">Cloud & backend toolkit</h3><SkillLibrary categories={['Cloud', 'Backend', 'Databases', 'Languages', 'Tools']}/></>}
            {panel === 'ai' && <><h3 className="verse-section-title">Applied AI toolkit</h3><SkillLibrary categories={['AI']}/></>}
            {(panel === 'cloud' || panel === 'ai') && <><h3 className="verse-section-title">Experience & credentials</h3><ExperienceRecords entries={engineeringRecords(panel)}/></>}
            <h3 className="verse-section-title">{panel === 'projects' ? 'All projects' : 'Public projects & learning labs'} · {filtered.length}</h3>
            <div className="verse-project-grid">{filtered.map(p => <TouchButton key={p.id} className="verse-project-card" onClick={() => inspect(p)}><img src={resolveAsset(p.image)} alt="" loading="lazy"/><div><small>{p.status ?? p.category[0]}</small><h3>{p.title}</h3><p>{p.technologies.slice(0, 3).join(' · ')}</p><span>Inspect project <ArrowUpRight size={15}/></span></div></TouchButton>)}</div>
          </>}
          {panel === 'career' && <><p className="verse-body-copy">The real journey, from learning the foundations to building software for people.</p><a className="verse-secondary" href={resumeLink} target="_blank" rel="noopener noreferrer"><FileText size={17}/> View resume <ArrowUpRight size={16}/></a><ExperienceRecords entries={experience}/><h3 className="verse-section-title">Complete skills library</h3><SkillLibrary/></>}
          {panel === 'knowledge' && <><p className="verse-body-copy">Pull up a chair. These are ideas, tutorials, and notes from my engineering journey.</p><div className="verse-article-list">{blogPosts.map(b => <a key={b.id} href={b.canonical || b.link} target="_blank" rel="noopener noreferrer"><BookIcon/><div><small>{b.category} · {b.readingTime ? `${b.readingTime} MIN READ` : b.date}</small><h3>{b.title}</h3><p>{b.excerpt}</p></div><ArrowUpRight size={20}/></a>)}</div></>}
          {panel === 'signal' && <><p className="verse-body-copy">Have a project in mind? Contact Harshit by email or connect on LinkedIn. Share what you want to build, your timeline, and how I can help.</p><div className="verse-contact-card"><span className="verse-status-dot"/><span>{PORTFOLIO_META.availability}</span><h3>Let’s talk about<br/>your next project.</h3><a href={`mailto:${PORTFOLIO_META.email}`}>{PORTFOLIO_META.email} <ArrowUpRight size={20}/></a><p><MapPin size={14}/> {PORTFOLIO_META.location}</p></div><div className="verse-actions"><a className="verse-primary" href={`mailto:${PORTFOLIO_META.email}`}><Mail size={18}/> Email Harshit <ArrowUpRight size={16}/></a><a className="verse-secondary" href={PORTFOLIO_META.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin size={18}/> Connect on LinkedIn <ArrowUpRight size={16}/></a></div><h3 className="verse-section-title">More ways to connect</h3><div className="verse-socials"><a href={PORTFOLIO_META.github} target="_blank" rel="noopener noreferrer"><Github/> GitHub <ArrowUpRight size={16}/></a><a href={resumeLink} target="_blank" rel="noopener noreferrer"><FileText/> Resume <ArrowUpRight size={16}/></a><a href={PORTFOLIO_META.medium} target="_blank" rel="noopener noreferrer">Medium <ArrowUpRight size={16}/></a><a href={PORTFOLIO_META.kaggle} target="_blank" rel="noopener noreferrer">Kaggle <ArrowUpRight size={16}/></a></div></>}
          {(panel === 'hub' || panel === 'guide') && <Guide/>}
          {panel === 'map' && <><p className="verse-body-copy">Seven places. One little world. Choose a destination to travel instantly.</p><div className="verse-map-layout"><WorldMap snapshot={snapshot} large onTravel={z => useGame.getState().teleport(...z.spawn)}/><div className="verse-map-destinations">{zones.map(z => <TouchButton key={z.id} onClick={() => useGame.getState().teleport(...z.spawn)}><span style={{ color: z.color }}><ZoneIcon zone={z}/></span><div><strong>{z.name}</strong><small>{z.subtitle}</small></div><ArrowUpRight size={15}/></TouchButton>)}</div></div><p className="verse-map-legend"><span/> Your location <span className="verse-map-path"/> Walking paths · All destinations available</p></>}
          {panel === 'missions' && <Journal/>}
          {panel === 'places' && <><p className="verse-body-copy">Open any portfolio section. You can also use the world map to travel there.</p><div className="verse-map-destinations">{zones.map(zone => <TouchButton key={zone.id} onClick={() => open(zone.id)}><span style={{ color: zone.color }}><ZoneIcon zone={zone}/></span><div><strong>{zone.name}</strong><small>{zone.subtitle}</small></div><ArrowUpRight size={15}/></TouchButton>)}</div></>}
          {panel === 'settings' && <Settings onClassic={onClassic}/>}
          {panel === 'help' && <Help/>}
        </>}
      </div>
      <footer className="verse-panel-footer"><span><span className="verse-status-dot"/> EXPLORE AT YOUR OWN PACE</span><TouchButton onClick={() => open(null)}>Close <kbd>ESC</kbd></TouchButton></footer>
    </div>
  </div>;
}
function SkillLibrary({ categories }: { categories?: string[] }) {
  return <div className="verse-skill-library">{skillGroups.filter(group => !categories || categories.includes(group.category)).sort((a, b) => categories ? categories.indexOf(a.category) - categories.indexOf(b.category) : 0).map(group => <section key={group.category}><h4>{group.category}</h4><div className="verse-tags">{group.skills.map(skill => <span key={skill.name}>{skill.name}</span>)}</div></section>)}</div>;
}
function ExperienceRecords({ entries }: { entries: ExperienceItem[] }) {
  return <div className="verse-timeline">{entries.map(entry => <article key={entry.id}><small>{entry.period || entry.date} / {entry.type.toUpperCase()}</small><h3>{entry.role || entry.title}</h3><h4>{entry.company || entry.organization}</h4>{entry.location && <p className="verse-record-location"><MapPin size={13}/> {entry.location}</p>}{(Array.isArray(entry.description) ? entry.description : [entry.description]).map((description, i) => <p key={i}>{description}</p>)}{entry.skills && <div className="verse-tags">{entry.skills.map(skill => <span key={skill}>{skill}</span>)}</div>}{entry.link && <a href={entry.link} target="_blank" rel="noopener noreferrer">View credential <ArrowUpRight size={13}/></a>}</article>)}</div>;
}
function BookIcon() { return <span className="verse-book-icon">✧</span>; }
function Help() {
  const touch = useTouchDevice();
  const controls = touch ? [
    ['Movement stick', 'Drag the left stick to move. Release to stop.'],
    ['Drag the world', 'Swipe the scene to look around while moving.'],
    ['Two fingers', 'Pinch the scene to change camera distance.'],
    ['Sprint', 'Tap to turn sprinting on or off.'],
    ['Jump', 'Tap to jump.'],
    ['Tap prompt', 'Interact with a nearby terminal or the guide.'],
    ['World map', 'Travel instantly to any destination.'],
    ['Places / Journal', 'Read portfolio sections or check your quest.'],
    ['Settings', 'Pause the game. Use Close to return.'],
  ] : [
    ['W A S D / arrows', 'Move around'], ['Mouse', 'Look around — click the world to capture'],
    ['Shift', 'Sprint'], ['Space', 'Jump'], ['E', 'Interact with nearby terminals & the guide'],
    ['M', 'World map & instant travel'], ['Tab', 'Missions & achievements'],
    ['Esc', 'Pause / close a panel'], ['Scroll', 'Camera distance'],
  ];
  return <><p className="verse-body-copy">Wander at your own pace, or open any destination from the menu. You can play in portrait or landscape.</p><div className="verse-controls-list">{controls.map(([key, value]) => <div key={key}><kbd>{key}</kbd><span>{value}</span></div>)}</div><p className="verse-small-note">No combat. No locked content. Just curiosity.</p></>;
}
function Guide() {
  const [answer, setAnswer] = useState('Welcome to HarshitVerse! I’m your guide. This island is a little window into Harshit’s work. What would you like to discover?');
  return <div className="verse-guide"><div className="verse-guide-portrait">HK<span>YOUR LOCAL GUIDE</span></div><p className="verse-dialogue">{answer}</p><div className="verse-dialogue-options">
    <TouchButton onClick={() => setAnswer(`${PORTFOLIO_META.name} is an ${PORTFOLIO_META.role} at ${PORTFOLIO_META.company}, based in ${PORTFOLIO_META.location}. He works across React, Python, Java, and Google Cloud.`)}>Who is Harshit? <ArrowUpRight size={15}/></TouchButton>
    <TouchButton onClick={() => useGame.getState().open('projects')}>Show me his projects. <ArrowUpRight size={15}/></TouchButton>
    <TouchButton onClick={() => useGame.getState().open('cloud')}>What technologies does he use? <ArrowUpRight size={15}/></TouchButton>
    <a href={resumeLink} target="_blank" rel="noopener noreferrer">I’d like to see his resume. <ArrowUpRight size={15}/></a>
    <TouchButton onClick={() => useGame.getState().open('help')}>How do I navigate this world? <ArrowUpRight size={15}/></TouchButton>
  </div></div>;
}
function Journal() {
  const done = useGame(s => s.completed); const visited = useGame(s => s.visited);
  const complete = missionObjectives.every(o => done.includes(o.id));
  return <><div className="verse-journal-heading"><Footprints size={31}/><div><p className="verse-eyebrow">INTRODUCTORY QUEST</p><h3>Meet the Engineer</h3><p>A few stops to get to know the person behind the pixels.</p></div></div><div className="verse-objectives">{missionObjectives.map(o => <div key={o.id} className={done.includes(o.id) ? 'is-complete' : ''}><span>{done.includes(o.id) ? <Check size={15}/> : ''}</span>{o.title}</div>)}</div><div className={`verse-badge ${complete ? 'is-earned' : ''}`}><OrbitBadge/><div><h3>World Explorer</h3><p>{complete ? 'Adventure complete. Thanks for exploring my world.' : 'Complete the introductory quest to earn this exploration badge.'}</p></div></div><h3 className="verse-section-title">Places discovered · {visited.length} / {zones.length}</h3><div className="verse-discoveries">{zones.map(z => <span key={z.id} className={visited.includes(z.id) ? 'is-earned' : ''}><ZoneIcon zone={z} size={19}/>{z.name}{visited.includes(z.id) && <Check size={12}/>}</span>)}</div><p className="verse-small-note">Exploration badges are saved on this browser. All portfolio content is available from the start.</p></>;
}
function OrbitBadge() { return <span className="verse-orbit-badge">✧</span>; }
function Settings({ onClassic }: { onClassic: () => void }) {
  const s = useGame();
  return <><p className="verse-body-copy">Your adventure is paused. Make this world feel right for you.</p><div className="verse-setting"><div><strong>Graphics quality</strong><p>Choose how much detail your browser renders.</p></div><div className="verse-segmented">{(['low', 'balanced', 'high'] as const).map(q => <TouchButton key={q} aria-pressed={s.quality === q} onClick={() => s.setQuality(q)}>{q}</TouchButton>)}</div></div><label className="verse-setting"><div><strong>Reduced motion</strong><p>Still lobby camera and fewer ambient animations.</p></div><input type="checkbox" checked={s.reducedMotion} onChange={e => s.setReducedMotion(e.target.checked)}/></label><label className="verse-setting"><div><strong><Volume2 size={16}/> Ambient sound</strong><p>A quiet, original synthesized soundscape.</p></div><input type="checkbox" checked={s.sound} onChange={e => s.setSound(e.target.checked)}/></label><div className="verse-actions"><TouchButton className="verse-primary" onClick={() => s.open(null)}>Continue exploring <ArrowUpRight size={17}/></TouchButton><TouchButton className="verse-secondary" onClick={() => s.setPlaying(false)}>Return to lobby</TouchButton><TouchButton className="verse-text-button" onClick={onClassic}>View Classic Portfolio <ArrowUpRight size={16}/></TouchButton></div></>;
}
