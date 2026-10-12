import TouchButton from './TouchButton';
import { useCallback, useEffect, useState } from 'react';
import { ArrowUpRight, ArrowRight, Compass, FileText, Map, Settings2, BookOpen, HelpCircle, Check, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { PORTFOLIO_META } from '../data/config';
import { resumeLink } from '../data/navigation';
import { useGame } from './store';
import { zones, missionObjectives } from './world';
import type { WorldSnapshot } from './Engine';
import WorldView from './WorldView';
import WorldMap from './WorldMap';
import ZoneIcon from './ZoneIcon';
import Panels from './Panels';
import TouchControls from './TouchControls';
import { createTouchInput } from './touchInput';
import useTouchDevice from './useTouchDevice';
import './game.css';

const initial: WorldSnapshot = { x: 0, z: 13, y: 0, region: 'hub', near: null, fps: 60, locked: false };
export default function HarshitVerse({ onClassic }: { onClassic: () => void }) {
  const [input] = useState(createTouchInput); const touch = useTouchDevice();
  const [snapshot, setSnapshot] = useState(initial); const [ready, setReady] = useState(false); const [error, setError] = useState('');
  const playing = useGame(s => s.playing), panel = useGame(s => s.panel), open = useGame(s => s.open), done = useGame(s => s.completed), sound = useGame(s => s.sound);
  const reducedMotion = useGame(s => s.reducedMotion);
  const onReady = useCallback(() => setReady(true), []); const onError = useCallback((message: string) => { setError(message); setReady(true); }, []);
  const region = zones.find(z => z.id === snapshot.region)!;
  const activeObjective = missionObjectives.find(o => !done.includes(o.id));
  const nearestLabel = snapshot.near === 'guide' ? 'Talk to the guide' : `Explore ${zones.find(z => z.id === snapshot.near)?.name ?? 'the world'}`;
  useEffect(() => {
    useGame.getState().setPlaying(false);
    return () => useGame.getState().setPlaying(false);
  }, []);
  useEffect(() => {
    if (!sound || !playing || panel || typeof AudioContext === 'undefined') return;
    const audio = new AudioContext(); const gain = audio.createGain(); gain.gain.value = 0.008; gain.connect(audio.destination);
    const tones = [130.81, 196, 261.63].map(f => { const tone = audio.createOscillator(); tone.type = 'sine'; tone.frequency.value = f; tone.connect(gain); tone.start(); return tone; });
    const resume = () => { void audio.resume().catch(() => {}); }; window.addEventListener('pointerdown', resume); window.addEventListener('keydown', resume); resume();
    return () => { window.removeEventListener('pointerdown', resume); window.removeEventListener('keydown', resume); tones.forEach(t => t.stop()); void audio.close(); };
  }, [sound, playing, panel]);
  const enter = () => { useGame.getState().setPlaying(true); useGame.getState().visit('hub'); };
  return <main className={`harshitverse ${playing ? 'is-playing' : 'is-lobby'} ${touch ? 'has-touch' : ''} ${reducedMotion ? 'verse-reduced-motion' : ''}`} data-track-scope="harshitverse" aria-label="HarshitVerse interactive portfolio">
    {!error && <WorldView input={input} onSnapshot={setSnapshot} onReady={onReady} onError={onError}/>}
    <div className="verse-atmosphere" aria-hidden="true"/>
    <header className="verse-topbar">
      <TouchButton className="verse-brand" onClick={() => { useGame.getState().setPlaying(false); }} aria-label="HarshitVerse lobby"><span className="verse-brand-symbol">H<span>V</span></span><div>HARSHIT<span>VERSE</span><small>EXPLORE · LEARN · BUILD · CONNECT</small></div></TouchButton>
      <nav aria-label="Portfolio shortcuts"><a href={resumeLink} aria-label="Resume" target="_blank" rel="noopener noreferrer"><FileText size={15}/><span>Resume</span></a><TouchButton className="verse-classic-link" onClick={onClassic} aria-label="Classic Portfolio"><span className="verse-classic-full">Classic Portfolio</span><span className="verse-classic-short" aria-hidden="true">Classic</span><ArrowUpRight size={16}/></TouchButton><TouchButton className="verse-icon-button" onClick={() => open('settings')} aria-label="Settings"><Settings2 size={19}/></TouchButton></nav>
    </header>
    {!ready && <div className="verse-loading" role="status"><Compass className="verse-loading-compass" size={42}/><p>Preparing your island</p><span>Building the world, one block at a time.</span><TouchButton onClick={onClassic}>View Classic Portfolio <ArrowUpRight size={16}/></TouchButton></div>}
    {error && <div className="verse-error" role="alert"><Compass size={40}/><h1>The world needs a different window.</h1><p>{error}</p><div className="verse-actions"><TouchButton className="verse-primary" onClick={onClassic}>View Classic Portfolio <ArrowUpRight size={17}/></TouchButton><TouchButton className="verse-secondary" onClick={() => open('projects')}>Explore projects</TouchButton></div></div>}
    {ready && !error && !playing && <>
      <section className="verse-lobby-copy">
        <p className="verse-eyebrow"><span className="verse-status-dot"/> WELCOME TO MY CORNER OF THE INTERNET</p>
        <h1>A little world.<br/>A lot to <em>discover.</em></h1>
        <p className="verse-lobby-intro">I’m {PORTFOLIO_META.name}, {PORTFOLIO_META.role.toLowerCase()}<br className="verse-wide-break"/> and a builder at heart. Come explore what I’m working on.</p>
        <div className="verse-lobby-actions"><TouchButton className="verse-enter" onClick={enter}><span><Compass size={21}/> Enter World</span><ArrowRight size={24}/></TouchButton><TouchButton className="verse-text-button" onClick={() => open('help')}><HelpCircle size={16}/> First time here? How to play</TouchButton></div>
        <div className="verse-lobby-note"><span>01 /</span> An adventure through my work, ideas, and journey.</div>
      </section>
      <div className="verse-lobby-profile"><Portrait/><div><strong>{PORTFOLIO_META.name}</strong><span>ENGINEER. BUILDER. EXPLORER.</span></div><span className="verse-profile-online" title="World ready"/></div>
      <div className="verse-scene-label"><span className="verse-coordinate">00° 00′ N / YOUR ADVENTURE AWAITS</span><div><span className="verse-location-symbol"><Compass size={22}/></span><div><small>START YOUR JOURNEY</small><strong>Central Hub</strong></div><span className="verse-scene-line"/></div></div>
    </>}
    {ready && !error && playing && <>
      <aside className="verse-player-card"><Portrait/><div><strong>{PORTFOLIO_META.name}</strong><span>World Explorer</span><div className="verse-progress"><i style={{ width: `${done.length / 4 * 100}%` }}/></div></div><span>{done.length}/4</span></aside>
      <aside className="verse-mission-card"><p className="verse-eyebrow">CURRENT QUEST</p><TouchButton onClick={() => open('missions')}><strong>Meet the Engineer</strong><ChevronRight size={15}/></TouchButton>{missionObjectives.map(o => <div key={o.id} className={`${done.includes(o.id) ? 'is-complete' : ''} ${activeObjective?.id === o.id ? 'is-current' : ''}`}><span>{done.includes(o.id) ? <Check size={11}/> : ''}</span>{o.title.replace('Central Hub ', '')}</div>)}{!activeObjective && <p className="verse-quest-complete">✧ World Explorer badge earned</p>}</aside>
      <TouchButton className="verse-minimap" onClick={() => open('map')} aria-label="Open world map"><div><WorldMap snapshot={snapshot}/><span className="verse-compass-n">N</span><span className="verse-compass-e">E</span><span className="verse-compass-s">S</span><span className="verse-compass-w">W</span></div><strong>{region.name}</strong><span>WORLD MAP <kbd>M</kbd></span></TouchButton>
      <div className="verse-key-hints" aria-label="Movement controls"><div><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><span>Move</span></div><div><kbd>SHIFT</kbd><span>Sprint</span><kbd>SPACE</kbd><span>Jump</span></div></div>
      {!panel && <div className="verse-interaction" aria-live="polite">{snapshot.near ? <TouchButton onClick={() => open(snapshot.near)}>{touch ? <span className="verse-tap-label">Tap</span> : <kbd>E</kbd>}<span>{nearestLabel}</span><ArrowRight size={17}/></TouchButton> : <span>{touch ? 'Drag the world to look around' : snapshot.locked ? 'Follow your curiosity.' : 'Click the world to look around · WASD to explore'}</span>}</div>}
      {touch && !panel && <TouchControls input={input}/>}
    </>}
    {ready && <footer className="verse-bottom"><div className="verse-destinations"><div className="verse-destination-heading"><span>THE WORLD</span><small>CHOOSE A PATH</small></div>{zones.map((zone, i) => <TouchButton key={zone.id} onClick={() => open(zone.id)} className={playing && zone.id === snapshot.region ? 'is-active' : ''} style={{ '--zone-color': zone.color } as React.CSSProperties}><span className="verse-zone-icon"><ZoneIcon zone={zone}/></span><div><small>0{i + 1}</small><strong>{zone.name}</strong></div><ArrowUpRight className="verse-zone-arrow" size={14}/></TouchButton>)}</div><div className="verse-bottom-meta"><span><span className="verse-status-dot"/> A PLAYABLE PORTFOLIO BY HARSHIT KANDOI</span><div><TouchButton className="verse-places-button" onClick={() => open('places')}><Compass size={14}/> Places</TouchButton><TouchButton onClick={() => open('map')}><Map size={14}/> World map <kbd>M</kbd></TouchButton><TouchButton onClick={() => open('missions')}><BookOpen size={14}/> Journal <kbd>TAB</kbd></TouchButton><TouchButton onClick={() => useGame.getState().setSound(!sound)} aria-label={sound ? 'Mute ambient sound' : 'Enable ambient sound'}>{sound ? <Volume2 size={15}/> : <VolumeX size={15}/>}</TouchButton><TouchButton onClick={() => open('help')} aria-label="How to play"><HelpCircle size={15}/></TouchButton></div></div></footer>}
    <Panels snapshot={snapshot} onClassic={onClassic}/>
  </main>;
}
function Portrait() { return <svg className="verse-portrait" viewBox="0 0 32 36" aria-hidden="true"><path fill="#152938" d="M0 0h32v36H0z"/><path fill="#344859" d="M5 26h22v10H5z"/><path fill="#deb08a" d="M8 9h16v17H8zM5 15h3v7H5zm19 0h3v7h-3z"/><path fill="#302522" d="M7 7h18v7H7zM5 9h4v8H5zm19 0h3v9h-3zM9 4h14v3H9z"/><path fill="#171e27" d="M10 17h3v3h-3zm9 0h3v3h-3z"/><path fill="#8b573d" d="M13 23h6v2h-6z"/><path fill="#e0e7df" d="M13 28h6v8h-6z"/><path fill="#203c4e" d="M5 27h5v9H5zm17 0h5v9h-5z"/></svg>; }
