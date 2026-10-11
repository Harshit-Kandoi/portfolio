// Build-time render of the classic page (see scripts/prerender.mjs). The HTML is put inside
// #root so the first paint doesn't wait for JavaScript; main.tsx then renders the live app
// over it with createRoot (not hydration), so per-visitor state can't cause mismatches.
import { renderToString } from 'react-dom/server';
import ClassicPortfolio from './components/classic/ClassicPortfolio';

export function render(): string {
  return renderToString(
    // Same wrapper App renders in classic mode.
    <div className="font-sans relative min-h-screen w-full text-white bg-[#05060f]" data-prerendered="">
      <ClassicPortfolio onTransition={() => {}} />
    </div>,
  );
}
