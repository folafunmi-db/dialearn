# Verification — 12 October 2026

## Current implementation

- Production build and TypeScript passed after adding all nine objects, dedicated routes, taster modals, isolated age choices, DIY guides and the Three.js viewer. Final mobile control spacing was subsequently rebuilt.
- Nine `/explore/[device]/` routes, four language readers, home and not-found are statically exported. Next reports 16 generated pages including its internal route generation.
- All eight new-device recorded-solid audits passed with zero failures, checking support, clearance, depth order and the rest / intermediate / exploded poses. Supported solid counts: controller 55, console 61, solar lamp 61, car 88, bicycle 82, drone 54, Arduino rover 61, Pi station 69. The phone retains its earlier SVG geometry and line checks.
- Native browser interaction verified: taster opens; age choice changes the object-page query and visible depth; global age remains 17–18 after opening a 12–14 visit; the normal page remains SVG; the separate Three.js modal loads its canvas; diagonal drag changes both yaw and tilt; reset returns to zero; mobile modal has reachable controls at 390 × 844.
- The Three.js viewer has roll and zoom sliders, part picking, keyboard arrows, an isolated age selector and a fallback status. It renders only while moving and visible. No measured frame-rate guarantee or formal full-orbit audit is claimed.
- Basic new-device descriptions have EN/FR/PT/AR text. Advanced descriptions, contributor histories, quizzes and DIY build instructions are English and labelled accordingly. Translations and teaching material require independent classroom review.
- DIY pages provide parts, explicit connection maps, step checklists, age-specific prompts and local starter files. Python starter syntax passed. Neither starter has been tested on physical hardware.
- Current opt-in offline manifest includes the object pages, models, renderer, readers and starter files: 83 resources, approximately 8.91 MB raw before HTTP compression. A complete offline session has not been repeated for this expanded pack.

## Earlier baseline checks

Before this expansion, Arabic at 390 px had no horizontal overflow and the landing page passed an axe audit with zero reported violations. A smaller 32-resource offline pack reloaded the Arabic home and French reader with browser networking disabled. Saved discoveries, source links, text-only mode, larger text, low-data mode, quizzes and energy controls were checked. These earlier checks are baseline evidence, not a new accessibility certification or a verification of every new state.

## Delivery

Source is uploaded only to the requested private GitHub repository and the user’s Vercel project. Build outputs, screenshots, local environment files, credentials, `.openai/` state and dependency caches are excluded from Git and Vercel source upload. No external source citations are available offline.
