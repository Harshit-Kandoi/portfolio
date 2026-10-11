import { lazy, Suspense, useEffect, useState } from 'react';
import ClassicPortfolio from './components/classic/ClassicPortfolio';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { useOSStore } from './store/useOSStore';

// The classic page and its prerender never import the WebGL bundle.
const loadWorld = () => import('./game/HarshitVerse');
const HarshitVerse = lazy(loadWorld);
export default function App() {
  const portalMode = useOSStore(s => s.portalMode);
  const setPortalMode = useOSStore(s => s.setPortalMode);
  const [desktop, setDesktop] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 900px) and (pointer: fine)').matches);
  const game = desktop && portalMode === 'os';
  useEffect(() => {
    const media = window.matchMedia('(min-width: 900px) and (pointer: fine)');
    const update = () => setDesktop(media.matches); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle('os-mode', game); document.body.classList.toggle('os-mode', game);
    return () => { document.documentElement.classList.remove('os-mode'); document.body.classList.remove('os-mode'); };
  }, [game]);
  const classic = () => { setPortalMode('classic'); };
  return <div className="font-sans relative min-h-screen w-full text-white bg-[#05060f]">
    {game ? <ErrorBoundary fallback={<div className="fixed inset-0 bg-[#102938] flex flex-col items-center justify-center gap-5"><h1>The world could not load.</h1><button className="px-5 py-3 border rounded" onClick={classic}>View Classic Portfolio</button></div>}>
      <Suspense fallback={<div className="fixed inset-0 bg-[#102938] flex flex-col items-center justify-center gap-5" role="status"><p>Loading HarshitVerse…</p><button className="px-5 py-3 border rounded" onClick={classic}>View Classic Portfolio</button></div>}><HarshitVerse onClassic={classic}/></Suspense>
    </ErrorBoundary> : <ClassicPortfolio onTransition={() => { if (desktop) { void loadWorld(); setPortalMode('os'); } else document.getElementById('lab')?.scrollIntoView({ behavior: 'smooth' }); }}/>}
  </div>;
}
