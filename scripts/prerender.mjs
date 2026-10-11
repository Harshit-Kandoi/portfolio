// Injects the server-rendered classic page into dist/index.html (runs after `vite build`
// and `vite build --ssr src/entry-prerender.tsx`; see the "build" script in package.json).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ssrDir = path.join(root, 'node_modules', '.prerender');
const indexPath = path.join(root, 'dist', 'index.html');

const entry = fs.readdirSync(ssrDir).find((f) => /^entry-prerender\.m?js$/.test(f));
if (!entry) throw new Error(`prerender: no SSR bundle found in ${ssrDir}`);
const { render } = await import(pathToFileURL(path.join(ssrDir, entry)).href);

const appHtml = render();
if (!appHtml.includes('<h1') || !appHtml.includes('id="contact"')) {
  throw new Error('prerender: rendered HTML is missing the hero heading or contact section');
}

// Runs before first paint: visitors who chose interactive mode or the dark classic theme
// shouldn't see a flash of the default light classic page.
const bootScript = `<script>(function(){try{var r=document.getElementById('root');` +
  `if(localStorage.getItem('portfolio-os-portal-mode')==='"os"'&&matchMedia('(min-width: 900px) and (pointer: fine)').matches){r.innerHTML='';return}` +
  `if(localStorage.getItem('classic_theme')==='dark'){var p=r.querySelector('.minimal-portfolio');p&&p.classList.replace('theme-light','theme-dark')}` +
  `}catch(e){}})();</script>`;

let html = fs.readFileSync(indexPath, 'utf-8');

const placeholder = '<div id="root"></div>';
if (!html.includes(placeholder)) throw new Error('prerender: <div id="root"></div> not found in dist/index.html');
fs.writeFileSync(indexPath, html.replace(placeholder, `<div id="root">${appHtml}</div>${bootScript}`));
fs.rmSync(ssrDir, { recursive: true, force: true });

console.log(`prerender: injected ${(appHtml.length / 1024).toFixed(1)} KB of classic page HTML into dist/index.html`);
