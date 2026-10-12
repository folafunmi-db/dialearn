# Verification — 12 October 2026

## Current implementation

- Production build and TypeScript passed after adding all nine objects, dedicated routes, taster modals, isolated age choices, DIY guides and the Three.js viewer. Final mobile control spacing was subsequently rebuilt.
- Nine `/explore/[device]/` routes, four language readers, home and not-found are statically exported. Next reports 16 generated pages including its internal route generation.
- All eight new-device recorded-solid audits passed with zero failures, checking support, clearance, depth order and the rest / intermediate / exploded poses. Supported solid counts: controller 55, console 61, solar lamp 61, car 88, bicycle 82, drone 54, Arduino rover 61, Pi station 69. The phone retains its earlier SVG geometry and line checks.
- Native browser interaction verified: library card navigates directly to a dedicated page; the object selector switches from drone to Raspberry Pi; taster opens from Start exploring; age choice changes the object-page query and visible depth; global age remains 17–18 after opening a 12–14 visit; the normal page remains SVG; the separate Three.js modal loads its canvas; diagonal drag changes both yaw and tilt; reset returns to zero; mobile modal has reachable controls at 390 × 844.
- The Three.js viewer has roll and zoom sliders, part picking, keyboard arrows, an isolated age selector and a fallback status. It renders only while moving and visible. The revised renderer uses neutral/graphite housings and modules, blue circuit boards, standard materials, and layout-based canvas dimensions. The canvas supersamples at up to 2× resolution and 1.5 million pixels to balance sharpness and mobile cost. No measured frame-rate guarantee or formal full-orbit audit is claimed.
- Basic new-device descriptions have EN/FR/PT/AR text. Advanced descriptions, contributor histories, quizzes and DIY build instructions are English and labelled accordingly. Translations and teaching material require independent classroom review.
- DIY pages provide parts, explicit connection maps, step checklists, age-specific prompts and local starter files. Python starter syntax passed. Neither starter has been tested on physical hardware.
- Current opt-in offline manifest includes the object pages, models, renderer, readers and starter files: 83 resources, approximately 8.92 MB raw before HTTP compression. A complete offline session has not been repeated for this expanded pack.

## Earlier baseline checks

Before this expansion, Arabic at 390 px had no horizontal overflow and the landing page passed an axe audit with zero reported violations. A smaller 32-resource offline pack reloaded the Arabic home and French reader with browser networking disabled. Saved discoveries, source links, text-only mode, larger text, low-data mode, quizzes and energy controls were checked. These earlier checks are baseline evidence, not a new accessibility certification or a verification of every new state.

## Delivery

Source is uploaded only to the requested private GitHub repository and the user’s Vercel project. Build outputs, screenshots, local environment files, credentials, `.openai/` state and dependency caches are excluded from Git and Vercel source upload. No external source citations are available offline.

## DIY, branding and palette update

- Build and TypeScript passed with a separate DIY lab: seven device cards, two on-site DIY builds and four credited external project ideas. The four original guide pages and their publisher/author credits were checked online; selection evidence is in `lib/diy-resources.ts`. They are not a global popularity ranking.
- Browser DOM confirms that the extra “Explore at your pace” card text is absent and that ICO, SVG and Apple touch icons are linked. The new open-book/stack mark was inspected at 180 px and in the header.
- Desktop DIY cards and guide links were visually checked; the page has no horizontal overflow at 390 px.
- The 3D palette now uses sage, forest and graphite tones, keeping the corrected layout-based canvas sizing and 2× rendering.
- Updated offline manifest: 86 files, 8.96 MB uncompressed. External DIY guides are links and still need internet.

### Dedicated DIY page (12 October 2026)
- Added static `/diy/`, with desktop navigation and 44px mobile section links from explore pages.
- Browser verified phone → DIY lab → Arduino rover guided exploration. DIY page contains two local builds, four credited original guides, and one H1 with ordered H2/H3 headings.
- No horizontal overflow at 390px or 1069px; mobile spacing inspected. TypeScript and production static export passed. This check does not certify physical hardware builds.

### Object switch placement
- Replaced the standalone object-picker row with a compact Change object control in the exploration header, alongside explanation depth.
- Mobile browser verified phone → dropdown → drone navigation with the current object selected in the menu. Final controls share a row at 390px, with no horizontal overflow. Desktop placement inspected; TypeScript and production build passed.

### DIY anatomy catalog (12 October 2026)
- Removed the external More build ideas tiles. Homepage and `/diy/` show five local anatomy cards; the main discovery grid retains seven everyday devices.
- Added breadboard LED, reaction timer and plant waterer pages, source-linked lessons, age-depth parts and guided activities. LED and reaction sketches are downloadable; watering links to GadhaGod’s original build and identifies the UNO/Nano difference.
- Final full geometry audit passed: LED 52 supported solids, timer 59, waterer 54; no reported failures. Original generated models also passed after dot metadata changes.
- Browser checked homepage counts, DIY navigation, circuit page, part selection, 390px overflow, assembled/exploded visual fixtures, and dark/reduced-motion rendering. Three.js LED model loaded with a 660px-wide buffer on mobile and rotation worked. Settings and viewport were restored.
- Fixture line helper returned zero ends but zero tested lines, so this is not an independent line-coverage certification. Full 3D orbit/performance audit and comprehensive 4× junction sweep were not run.
- Reaction sketch compiled with a temporary C++ Arduino-API simulation; elapsed-time, early-press, release and timeout checks passed. Physical electronics have not been tested.
- TypeScript/static production build passed. Offline manifest: 105 URLs, 10.90 MB before compression. Full expanded network-off session not rerun.

### Hero captions and pocket reveal
- Diagram hint and assembly toggle now occupy a normal-flow row below the hero illustration. The decorative orbit is confined to the illustration.
- Removed the annotation from the phone. Ideas inside reveals a localized pocket note on mouse entry, keyboard focus or tap; blur dismisses it. Soft opacity/position transitions respect reduced-motion preferences.
- Browser verified mouse entry, Tab/Shift+Tab reveal and dismissal, and mobile tap at 390px. Hint top is below artwork bottom; note bottom is above description top. No mobile horizontal overflow. Viewport restored. TypeScript and production build passed.

### Three.js pointer and selection
- Selectable raycast hits now show a pointer cursor; active rotation shows grabbing. Hover/click results are validated against the current age’s available parts.
- Selected solids have a stronger sage tint and outline. The detail text announces changes politely; the text part selector remains available.
- Browser verified drone motor hover (computed cursor pointer), click selection, and a 57° drag that preserved the selected motor. At 390px, clicking a propeller changed both selector and description to Propellers without horizontal overflow. Viewport restored.
- TypeScript and production build passed.
