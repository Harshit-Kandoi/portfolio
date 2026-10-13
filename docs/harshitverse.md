# HarshitVerse implementation

## Repository audit

React 18, TypeScript, Vite 6, Tailwind 4, Zustand and Framer Motion. There is no client router: App selects classic or interactive mode using the existing persisted portal setting. The classic page is separately prerendered for SEO. Netlify functions provide contact and GitHub APIs; analytics is initialized in main.tsx. There were no 3D dependencies.

Portfolio facts come from src/data/config.ts, projects.ts, experience.ts, skills.ts and blogs.ts. Resume navigation uses the base-aware asset helper. ClassicPortfolio has three interactive entry points: the navbar, hero shortcut and lab preview. Desktop.tsx and its window/taskbar tree previously rendered the interactive mode.

## Initial MVP plan

1. Keep the classic page, public URLs, content data, analytics initialization, prerender and Netlify configuration. Replace the interactive App branch and its preview/labels. New visitors start in classic; the current game supports both desktop and touch input.
2. Add a lazy Three.js module with original procedural voxel geometry, a kinematic player, bounded movement, building collision and a camera constrained by world collision volumes. Reuse Zustand for versioned exploration state. Avoid physics/WASM dependencies for this compact, level island.
3. Build the hub, Project District, Cloud Citadel and Career Guild. Use shared instanced geometry for foliage, masonry and decorative detail; add sunset lighting, water, lanterns and distant islands.
4. Integrate existing project/career/skills/blog records through accessible HTML panels, a guide, map, fast travel and introductory mission. Content is always available directly.
5. Verify controls, mission persistence, modal focus, mobile/classic fallback, production prerender and scene cleanup. Inspect the browser and record any limits.

## Assets and scope

The world uses original procedural geometry and canvas-generated signs, rather than stock game models or the reference image as a background. There are no remote 3D assets, backend additions, accounts or confidential architecture exhibits. Existing project thumbnails and resume are reused. The shipped career and project descriptions remain the source of truth.

Historical OS modules are retained because their apps, store and tests have shared dependencies; they are no longer loaded by the interactive entry. Removing that legacy tree is a separate cleanup once those dependencies are migrated.

## Terrain and layout polish

The ground layout now uses distinct rock and grass layers, a single shared paving grid for the plaza and every route, and a recessed river bed. Path intersections and bridge approaches no longer contain stacked paving surfaces. Position-based colors reduce the patchwork effect without changing the voxel style. All fast-travel arrivals remain paved and the existing level-ground movement and river collision rules remain valid.

The lobby camera has a wider view of the hub and adjacent buildings. Gameplay uses a shorter header and destination dock, smaller minimap, and larger mission text. Lobby copy has bounded scrolling on short screens, destination labels wrap on narrower displays, and panel headers and footers remain fixed while their contents scroll. Below 560 pixels in height, the quest shows the active objective; the full journal remains available.

Focused terrain checks cover paving overlap, river clearance, support-layer contact, arrival paving and bridge approaches. Browser layout checks cover 1440 × 900, 1366 × 768, 1024 × 640 and 900 × 500 viewports alongside the existing movement, interaction, mission and camera checks.

This polish pass passed TypeScript, production build/prerender and seven focused terrain/navigation/state tests. The three existing game browser checks passed against the production build; the new responsive check passed separately after reducing duplicate screenshots that exceeded the software-renderer time budget. Screenshots were reviewed for the hub, Project District, Cloud Citadel and compact lobby/gameplay layouts. The latest low-quality browser sample used 30 draw calls. Hardware frame-rate validation is still outstanding.

## Mobile support

The desktop-only entry restriction has been removed. Every classic launch button now opens HarshitVerse on phones and tablets, and a saved interactive preference opens the lobby on any screen. Visitors without a saved preference continue to start in classic. Prerendered content remains readable if the app bundle fails to load.

Touch controls share transient input with the same movement and collision loop used on desktop. The left stick provides proportional movement, a swipe on the scene rotates the camera, and two fingers pinch to adjust distance. Sprint is a toggle, Jump is a tap, and nearby prompts open the same content panels. Separate pointer capture allows movement and camera input at the same time. Input clears on menus, travel, blur, page hiding, rotation/resizing and teardown; touch input never requests mouse pointer lock.

Touch layouts use a compact Places menu, map and journal, scrollable HTML panels, 44-pixel menu targets, safe-area padding and dynamic viewport height. Both portrait and landscape are supported. Touch devices default to low graphics unless a persisted preference overrides it. Their renderer disables multisample antialiasing, caps pixel ratio at 1 / 1.25 / 1.5 for low / balanced / high and uses 1024-pixel shadow maps when shadows are enabled.

Mobile verification passed TypeScript, lint, production build/prerender and all 97 unit tests, including 13 focused terrain/navigation/touch checks. The production Chromium checks passed across 13 cases: desktop gameplay and layouts, saved-session and WebGL fallback behavior, classic mobile navigation and prerender, and three mobile game scenarios. Native touch dispatch covered simultaneous stick/camera/button input, jumping, sprinting, pinch zoom, map travel, paused movement, rotation, direct career/project content and swipe scrolling. Layout checks included 320 × 568 portrait and 851 × 393 landscape. Reviewed previews are retained as [mobile portrait](screenshots/mobile-portrait.png) and [mobile landscape](screenshots/mobile-landscape.png). These are phone-emulation checks; physical Android/iOS performance and Safari still require device validation.

## Scenery, visibility and exhibit content

The rendered scenery and its collision bounds now come from one deterministic layout. Trees, low plants, shrubs, raised garden beds, benches, lamps, bridge rails, destination terminals, the guide and building wings block movement. Camera collision uses each solid object's actual vertical bounds so low plants do not behave like tall walls. Navigation checks flood the island with the same collision rules and confirm that all seven fast-travel landings remain clear and reachable on foot. Buildings continue to open their content at exterior terminals.

Building entrances now have framed doorways and side windows. Project District has a broader roof silhouette, Cloud Citadel has buttresses and side lighting, and Knowledge Tavern has a supported porch. Reduced fog, signs placed ahead of roof edges, and camera-facing terminal labels above the avatar's head make the destinations clearer from different approaches. Gameplay starts with the avatar facing the world.

Signal Peak is now Contact Beacon, a communications lodge with a rooftop beacon. Its signs, map labels and mail icon explicitly identify contact. The panel offers email and LinkedIn actions, current availability and location, plus GitHub, resume, Medium and Kaggle links. Its persisted `signal` identifier is retained for existing discoveries.

Cloud Citadel and AI Nexus reuse the current portfolio's skills, professional experience, education and credentials alongside their public project lists. Career Guild includes locations, skills per record and the complete grouped skills library. No additional career claims or project results were invented. Touch buttons also activate on a completed primary touch release when the browser omits a compatibility click after scrolling, while cancelled scroll gestures and duplicate clicks are ignored.

The three exhibits now have separate presentations. Career Guild keeps the chronological timeline with an amber accent. Cloud Citadel uses a cyan capability board, public service/lab rows, contribution cards and credential cards. AI Nexus opens a purple project gallery with Projects, Applied AI and Learning views. Its applied-work cards lead with the relevant AI contribution; expandable details retain every other source description. Cloud and AI records use cards rather than the career timeline. Both presentations stack for phones, and the first two AI thumbnails load eagerly.

This pass passed TypeScript, lint, all 106 unit tests and production build/prerender. Desktop browser checks covered terminal and building collisions, jumping, panels, camera obstruction, exhibit content and responsive layouts. Mobile game checks covered simultaneous movement/camera/jump input, sprinting, pinch zoom, map travel, paused movement, Settings, rotation and the WebGL fallback after swipe scrolling. Jump verification records the actual peak height to avoid missing a short jump between software-renderer samples. The guide/mission and classic mobile checks also passed. Final previews are retained in [screenshots](screenshots/), including the [Cloud exhibit](screenshots/cloud-exhibit.png), [Contact panel](screenshots/contact-exhibit.png) and [Contact entrance](screenshots/contact-path.png). Mobile checks use Chromium phone emulation; physical-device performance and Safari remain unverified.

## Pause dismissal and career categories

The pause menu records intentional mouse-capture releases before requesting the browser unlock. A delayed `pointerlockchange` notification can no longer reopen Settings after Continue exploring, either Close button, or Escape. Unexpected capture loss and window blur still pause gameplay. Escape auto-repeat is ignored by both the game handler and the panel focus trap so a held key cannot repeatedly open and close the menu. A deterministic browser regression reproduced the delayed-unlock loop before this fix.

Career Guild has All, Work Experience, Education and Certifications buttons with counts. The existing timeline, complete descriptions, locations, skills, resume and credential links are retained; Certifications includes the portfolio's certification/course records. Filters remain available while scrolling and use two columns on phones. Each new visit starts with All. Unit checks verify complete record retention and filter reset, and browser checks exercise desktop clicks and native phone touches.

Validation passed TypeScript, lint, production build/prerender and all 109 unit tests. The full production browser run passed 24 of 26 checks; the stale viewport expectation and the phone Close selector were corrected, and both checks passed on rerun. The strengthened pause regression also passed against the final build, covering delayed unlocks, capture completion after a panel opens, rapid clicks, held Escape, blur, resumed movement and real mouse-capture cycles. Phone gameplay and filtering passed with 44-pixel targets and no horizontal overflow at 320 pixels. Reviewed previews include [desktop career](screenshots/career-exhibit.png), [phone filters](screenshots/career-filters-mobile.png) and [compact phone filters](screenshots/career-filters-compact.png).

## Performance

Balanced mode limits device pixel ratio to 1.5 with one shadow-casting directional light. Low mode uses pixel ratio 1 and disables shadows. Solid scenery uses instance colors in one shared mesh, with a separate batch for each glowing accent. Each animated avatar uses a single instanced mesh; water foam and lantern glow are also batched. Scene resources, movement/camera listeners, instance buffers, the animation loop and the WebGL context are released on exit. The temporary touch click guard clears on the follow-up click or new pointer/keyboard input. Reduced motion disables the lobby camera orbit, atmospheric motion and interface animations.

The current Chromium software-renderer check sampled 37 draw calls and 3 FPS at 1440 × 900 in low mode. That is a constrained software-rendering measurement, not a hardware benchmark. The 30/60 FPS targets still require testing on real laptops and desktops.

## Initial MVP verification

- TypeScript validation passed.
- 88 unit tests passed, including valid travel landings, river/bridge and building collision, interaction radii and exploration state.
- Full browser suite: 19 passed, with the production-only prerender check skipped on the dev server.
- After visual review, all three dedicated game tests passed again: walking/sprinting/jumping, building collision, paused movement, real project content, guide dialogue, fast travel, mission completion and reload persistence, direct sections, focus containment, mouse capture/release and camera obstruction. No critical game/shader errors were reported in the core browser check.
- Production build and classic-page HTML prerender passed. The game is a separate lazy chunk (about 162 KB compressed), with no external 3D asset requests.
- Four production browser checks passed: JavaScript-disabled content, saved desktop sessions entering the game and returning to classic (including graphics cleanup), responsive mobile fallback, and mobile prerender remaining visible when the React bundle is blocked.
- Screenshots are retained in [screenshots](screenshots/): lobby, gameplay, project details, journal and map. Visual review corrected the lobby sight line and reduced-motion panel rendering.

The in-app browser connection timed out; verification used the repository's Chromium test runner. The world is an original procedural voxel MVP, rather than the high-detail concept artwork. Custom modeled assets, richer terrain elevations and further art/performance profiling remain future work. Project architecture and outcome details are limited to verified records in the existing content data.
