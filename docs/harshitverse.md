# HarshitVerse implementation

## Repository audit

React 18, TypeScript, Vite 6, Tailwind 4, Zustand and Framer Motion. There is no client router: App selects classic or interactive mode using the existing persisted portal setting. The classic page is separately prerendered for SEO. Netlify functions provide contact and GitHub APIs; analytics is initialized in main.tsx. There were no 3D dependencies.

Portfolio facts come from src/data/config.ts, projects.ts, experience.ts, skills.ts and blogs.ts. Resume navigation uses the base-aware asset helper. ClassicPortfolio has three interactive entry points: the navbar, hero shortcut and lab preview. Desktop.tsx and its window/taskbar tree previously rendered the interactive mode.

## Plan

1. Keep the classic page, public URLs, content data, analytics initialization, prerender and Netlify configuration. Replace the interactive App branch and its preview/labels. Mobile defaults to classic, including saved desktop sessions.
2. Add a lazy Three.js module with original procedural voxel geometry, a kinematic player, bounded movement, building collision and a camera constrained by world collision volumes. Reuse Zustand for versioned exploration state. Avoid physics/WASM dependencies for this compact, level island.
3. Build the hub, Project District, Cloud Citadel and Career Guild. Use shared instanced geometry for foliage, masonry and decorative detail; add sunset lighting, water, lanterns and distant islands.
4. Integrate existing project/career/skills/blog records through accessible HTML panels, a guide, map, fast travel and introductory mission. Content is always available directly.
5. Verify controls, mission persistence, modal focus, mobile/classic fallback, production prerender and scene cleanup. Inspect the browser and record any limits.

## Assets and scope

The world uses original procedural geometry and canvas-generated signs, rather than stock game models or the reference image as a background. There are no remote 3D assets, backend additions, accounts or confidential architecture exhibits. Existing project thumbnails and resume are reused. The shipped career and project descriptions remain the source of truth.

Historical OS modules are retained because their apps, store and tests have shared dependencies; they are no longer loaded by the interactive entry. Removing that legacy tree is a separate cleanup once those dependencies are migrated.

## Performance

Balanced mode limits device pixel ratio to 1.5 with one shadow-casting directional light. Low mode uses pixel ratio 1 and disables shadows. Solid scenery uses instance colors in one shared mesh, with a separate batch for each glowing accent. Each animated avatar uses a single instanced mesh; water foam and lantern glow are also batched. All scene resources, input listeners, instance buffers, the animation loop and the WebGL context are released on exit. Reduced motion disables the lobby camera orbit, atmospheric motion and interface animations.

The Chromium software-renderer check sampled 30 draw calls and 4 FPS at 1440 × 900 in low mode. That is a constrained software-rendering measurement, not a hardware benchmark. The 30/60 FPS targets still require testing on real laptops and desktops.

## Verification

- TypeScript validation passed.
- 88 unit tests passed, including valid travel landings, river/bridge and building collision, interaction radii and exploration state.
- Full browser suite: 19 passed, with the production-only prerender check skipped on the dev server.
- After visual review, all three dedicated game tests passed again: walking/sprinting/jumping, building collision, paused movement, real project content, guide dialogue, fast travel, mission completion and reload persistence, direct sections, focus containment, mouse capture/release and camera obstruction. No critical game/shader errors were reported in the core browser check.
- Production build and classic-page HTML prerender passed. The game is a separate lazy chunk (about 162 KB compressed), with no external 3D asset requests.
- Four production browser checks passed: JavaScript-disabled content, saved desktop sessions entering the game and returning to classic (including graphics cleanup), responsive mobile fallback, and mobile prerender remaining visible when the React bundle is blocked.
- Screenshots are retained in [screenshots](screenshots/): lobby, gameplay, project details, journal and map. Visual review corrected the lobby sight line and reduced-motion panel rendering.

The in-app browser connection timed out; verification used the repository's Chromium test runner. The world is an original procedural voxel MVP, rather than the high-detail concept artwork. Custom modeled assets, richer terrain elevations and further art/performance profiling remain future work. Project architecture and outcome details are limited to verified records in the existing content data.
