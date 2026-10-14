# Dialearn

A Next.js App Router learning website for **young learners, from beginner to advanced**. Explore 61 devices, machines, infrastructure systems and DIY projects, trace inventions and contributors, and try guided Arduino and Raspberry Pi builds.

## Run

Requires Node.js 20.9+ and pnpm.

```sh
pnpm install
pnpm dev
```

```sh
pnpm typecheck
pnpm build
pnpm start
```

`pnpm start --port 3108` previews the built export locally. The static export is in `out/`; serve it over HTTPS (localhost is also supported). `next start` is not used for static exports. `pnpm build` generates the Anatomy SVG and an offline asset manifest. Host all paths, including `sw.js`, at the origin root.

## Deliberate choices

- Next.js static export, no backend, no authentication, telemetry, ads or remote media.
- The phone lessons and the basic descriptions for eleven additional devices and projects have English, French, Portuguese and Arabic text; Arabic uses RTL. **Translations are draft content and require native-speaker review.** Additional languages can be added in `lib/content.ts` and `lib/i18n.ts`.
- Learners choose explanation depth, visual/text mode, larger text, reduced motion and a local discussion context. These settings never gate content or assign ability profiles.
- A separate `/read/en/` (and `fr`, `pt`, `ar`) reader has all material in server-rendered HTML, usable with JavaScript disabled and printable through the browser.
- Privacy: only preferences and saved part identifiers are stored in `localStorage` under `dialearn.v1`. Quiz choices stay in memory. Local speech synthesis uses **only on-device voices**; lack of a compatible voice does not block text learning. Shared browsers can expose saved discoveries; this is explained in the UI.
- Offline is opt-in. After a successful **Save for offline**, service workers cache the static site, all language readers, and app assets. First access requires connectivity; external citations remain online. Browser storage may be evicted. The production build prints the uncompressed pack size.
- Local context choices are prompts, not verified curriculum, qualification or institution mappings. No location is detected.
- Learning content is source-linked to primary institutions/manufacturers plus iFixit repair documentation. It is a simplified draft, **not independently reviewed teaching material**. Source linking is not endorsement. Review before classroom deployment.

## Content and geometry

`lib/content.ts` contains the phone lessons; `lib/devices.ts` adds controller, handheld console, electric car, solar lamp, bicycle, drone, Arduino rover and Raspberry Pi station lessons, named contributors and primary references. Assembly counts vary by project and are derived from the catalogue. Advanced new-device explanations, quizzes and history currently remain English and are labelled as such in other languages. `scripts/generate-art.mjs` and `scripts/generate-devices.mjs` use the Anatomy isometric kit to generate precomputed geometry; the initial diagrams use precomputed SVG; the optional rotation renderer loads on demand. The SVG is an explanatory model, not a scale drawing or device repair guide. Many electronic parts, wiring, interconnects and manufacturing steps are omitted. The breakdown floats assemblies away from their assembled locations and animates them back into place; it does not reproduce a particular manufacturer's disassembly procedure.

The bicycle experiment computes front-chainring teeth divided by rear-sprocket teeth; it is an ideal single-speed model.

The energy experiment computes `runtimeHours = wattHours / watts`. The example values are not a phone specification; real runtime varies with efficiency, use, temperature and battery age.

Anatomy code in `vendor/anatomy/` retains its MIT license. Artwork is built in code; no third-party photographs are used. The bundled DM Sans font uses the SIL Open Font License.

## Hosting

`.openai/hosting.json` points Sites to the static `out` directory. `public/_headers` supplies suggested security headers for hosts that support this convention; configure equivalent HTTP headers on other hosts. Security header enforcement depends on hosting support.

## UI and learning stages

Reusable controls are the official **shadcn/ui Base UI** components (Nova preset), installed in `components/ui/`. `components.json` records `base-nova`, RTL support and aliases. Tailwind v4 supports their styling; the site keeps its custom field-notebook theme and self-hosted font. No Radix primitives are used.

Learners choose **Beginner, Intermediate or Advanced**. These difficulty levels change selectable detail, default explanation depth and teaching experiments. Any learner can choose any level and switch whenever they want. The chosen level is a browser-local preference, not an assessment or a fixed ability profile. Internal stage keys remain `foundations`, `systems` and `engineering` for saved preferences and links. Technical illustrations are explanatory models, not microscopic scale drawings.

## Mobile workshops

At phone widths the dedicated workshop has a sticky site header and part selector, a compact diagram that can expand, and touch targets at least 44px tall. Selecting a part scrolls the lesson into view. New device SVG geometry loads locally on demand; static thumbnails use lazy loading. Offline saving includes every device and all text readers. The continuous renderer loads only when rotation is requested.

Run `node scripts/generate-devices.mjs --audit` for recorded-solid support, clearance and painter-order checks. `ANATOMY_DEVICE=car` (or another device ID) scopes an audit. Drawings remain teaching simplifications, not scale models or manufacturer disassembly instructions.

## Orientation and difficulty settings

A compact floating difficulty selector stays within reach across pages and updates the same general preference as Learning settings. It is hidden while dialogs are open or a text field is being edited. The difficulty level applies across the website. Each initial taster modal also has a visit-only difficulty selector: its choice is passed through `?stage=` to the dedicated `/explore/[device]/` page without writing the general preference. The 3D modal has its own temporary difficulty selector too.

Library cards navigate directly to dedicated object pages. Start exploring opens a short taster modal with an “Explore this object” link. Each dedicated page has an object selector for searching among the available devices and projects. All objects have dedicated pages for anatomy, explanations, manufacturing, contributors, sources and challenges. The normal diagram remains SVG. The 3D view uses neutral sage housings, graphite power modules, forest green circuit boards and softly lit standard materials. Canvas sizing follows layout dimensions to avoid stretching during modal animations. “Explore in 3D” opens a full-screen Three.js workspace with a floating selected-part lesson and continuous yaw and tilt dragging, roll and zoom sliders, on-canvas zoom buttons, wheel and two-finger pinch zoom, keyboard arrows, part picking and reset. The renderer loads only on opening, renders at up to 2× resolution with a 1.5-million-pixel budget and stops drawing when idle, hidden or offscreen. Reduced motion removes the easing tail. WebGL-unavailable devices retain the normal diagram and all lessons.

Hover descriptions anchor to the selected solid or SVG element. They use `pointer-events: none` throughout, so clicks and drags reach the object. Popups and page transitions use restrained motion with reduced-motion overrides.

Arduino rover and Raspberry Pi weather station pages include parts, wiring tables, stage-specific challenges, session-only build checklists and downloadable `.ino` / `.py` starters. The guides and code are educational drafts, not physically tested kits. Pi setup requires initial internet access for software; logging then runs locally. Build instructions currently remain English. Readers and the opt-in offline pack include these guides and starter files.

## GitHub and Vercel

The source is intended for the private `folafunmi-db/dialearn` repository. `vercel.json` configures a static deployment (framework `null`) of the Next.js export with `pnpm build` and `out/` output, plus response headers. No server secrets are needed. `.env*`, `.vercel/`, `.openai/`, screenshots, caches, dependencies and build outputs are excluded from Git. The connected Vercel project deploys commits on `main`.

## DIY lab and identity

The landing page groups discoveries by type and separates them from five DIY anatomy projects, with a dedicated `/diy/` page. The DIY cards open local anatomy pages for an Arduino rover, Raspberry Pi station, Arduino breadboard LED, reaction timer and plant waterer. There is no separate external “More build ideas” grid. LED and reaction projects include downloadable educational starters; watering is a planning lesson linked to GadhaGod’s original hardware guide. Original guide links and author credits live with the project lessons. External sources need internet. Desktop navigation and mobile section links reach the DIY lab from every object page.

The logo is an open book over two stacked learning layers. Matching SVG, ICO and Apple touch icons are in `app/`; the mark stays clear at small sizes. The 3D palette uses consistent forest/sage accents and neutral graphite materials with high-resolution canvas rendering.

The brand mark uses offset book spines and an open book with a discovery spark. `scripts/generate-brand.mjs` rasterizes the SVG icon into the 16/32/48px ICO and 180px Apple touch icon during builds.

Object switching lives in the exploration heading as a compact “Change object” control, alongside the explanation-depth buttons. It opens a searchable modal with project cards.

Light and dark modes are available from the header (or mobile navigation) and Learning settings. The saved theme loads before rendering; new visits use the system theme. Dark mode uses neutral charcoal surfaces with green highlights; green highlights remain visible in both modes.

Object explorations start with no part selected unless opened through an explicit part link. Click a part to open its lesson; click the diagram background, press Escape on the diagram, or use Clear selection to return to the prompt. The 3D modal starts unselected independently and preserves selection while dragging.

Page backgrounds and section dividers span the viewport. Content stays centered with a 1190px maximum width and responsive gutters; mobile object pages use the available width.

The 3D canvas fills the workspace beneath its header. Rotation, zoom and part selection use floating controls; additional angle sliders are available under Adjust view. Selected-part descriptions float above the canvas and disappear when the selection is cleared.

## Project publishers and subscriptions

Current projects are published by the **Dialearn team**, with separate credit to the original inventors and source authors. Learners can choose updates from all projects, a particular educator, or one or more project categories (including DIY). Educators can propose subsequent projects for review and publisher credit. These subscription/proposal flows are prototypes: no email is sent or subscription saved without the receiving endpoints described in `docs/community-setup.md`.
